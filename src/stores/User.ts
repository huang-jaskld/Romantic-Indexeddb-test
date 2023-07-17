import {
  BasicStore,
  Entity,
  Field,
  Index,
  PrimaryKeyField,
} from "../libs/decorator/index";

const E: Function = Entity;
const F: Function = Field;
const I: Function = Index;
const P: Function = PrimaryKeyField;

@E
class User extends BasicStore {
  @P({ autoIncrement: true })
  id?: number = undefined;

  @F
  user_name!: string;

  @I()
  age!: number;
}

export default User;
