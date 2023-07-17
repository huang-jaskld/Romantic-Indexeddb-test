export interface fieldDescriptionOptions {
  index?: boolean; // 是否添加索引
  unique?: boolean; // 是否唯一
}

export interface StoreOptions {
  name: string; // 对象仓库名称
  primaryField: {
    name: string;
    autoIncrement: boolean;
  };
  isClear?: boolean; // 版本更新时是否清除
  fields: {
    [fieldName: string]: fieldDescriptionOptions;
  };
}

class DBMetadataArgs {
  status: boolean = false; // 是否创建/打开
  private objectStores: Array<StoreOptions> = []; // 对象仓库
  private db?: IDBDatabase = undefined;

  // 获取数据库
  getDBMetaDataBase() {
    return this.db || null;
  }

  // 外部获取并设置数据库
  setDBMetaDataBase(db: IDBDatabase) {
    this.db = db;
  }

  // 获取对象仓库数组
  getDBMetaObjectStores() {
    if (this.status === true) return null;
    return this.objectStores;
  }
}

export default DBMetadataArgs;
