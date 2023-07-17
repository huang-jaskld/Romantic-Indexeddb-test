import { StoreOptions } from "./../metedata-args/DBMetadataArgs";

class BasicStore {
  static store: Partial<StoreOptions> = {
    name: undefined,
    primaryField: undefined,
    isClear: undefined,
    fields: {},
  };
}

export function getStore(target: ClassDecorator & { store?: StoreOptions }) {
  try {
    if (target.store) return target.store;
    return Object.getPrototypeOf(target).constructor.store;
  } catch (e) {
    throw new Error("对象仓库类需要继承BasicStore");
  }
}

export default BasicStore;
