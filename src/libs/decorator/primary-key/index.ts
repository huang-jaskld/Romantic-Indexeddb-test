import { getStore } from "../basic-store";

export interface PrimaryKeyOptionsType {
  autoIncrement?: boolean; // 是否自增
}

export default function PrimaryKeyField(params: PrimaryKeyOptionsType) {
  return function (target: ClassDecorator, propropertyName: string) {
    let { autoIncrement = false } = params;
    let store = getStore(target);
    let res = {
      ...params,
      name: propropertyName,
      autoIncrement,
    };
    store.primaryField = res;
  };
}
