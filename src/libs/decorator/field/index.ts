import { getStore } from "../basic-store";

export default function Field(target: ClassDecorator, propropertyName: string) {
  let store = getStore(target);
  store.fields[propropertyName] = {};
}
