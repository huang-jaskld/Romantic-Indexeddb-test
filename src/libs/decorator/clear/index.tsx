import { getStore } from "../basic-store";

export default function Clear(target: ClassDecorator, propropertyName: string) {
    let store = getStore(target)
    store.isClear = true
}
