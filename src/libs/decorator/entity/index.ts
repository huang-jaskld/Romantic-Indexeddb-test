import { getMetadataArgsStorage } from "../../globals";
import { getStore } from "../basic-store";

export default function Entity(target: ClassDecorator) {
  let store = getStore(target);
  getMetadataArgsStorage()
    .getDBMetaObjectStores()
    ?.push({ ...store, name: target.name });
  Reflect.deleteProperty(target, "store");
}
