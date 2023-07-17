import { getStore } from "../basic-store";

interface IndexFieldOptions {
  unique?: boolean;
}

export default function IndexField(params: IndexFieldOptions) {
  if (!params) {
    params = {};
  }
  return function (target: ClassDecorator, propropertyName: string) {
    let { unique = false } = params;
    let store = getStore(target);

    store.fields[propropertyName] = {
      ...store.fields[propropertyName],
      index: true,
      unique,
    };
  };
}
