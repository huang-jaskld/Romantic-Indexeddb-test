import DBMetadataArgs, {
  StoreOptions,
} from "./decorator/metedata-args/DBMetadataArgs";
import {
  RepositoryReadonly,
  RepositoryWrite,
  _getRepository,
} from "./repository";

type getRepository_T = (
  storeClass: Object,
  type?: "readwrite" | "readonly"
) => RepositoryReadonly | RepositoryWrite;

export interface createConnectionOptions {
  dbName: string;
  dbVersion: number;
  objectStores: Array<any>;
}

type Connection_T = { db: IDBDatabase; getRepository: getRepository_T };

export function createConnection(
  options: createConnectionOptions
): Promise<Connection_T> {
  return new Promise((resolve, reject) => {
    let { dbName, dbVersion } = options;
    // IndexDB实例
    let _db: null | IDBDatabase = null;
    // 连接IndexedDB
    let IDB = window.indexedDB;
    let dbRequest = IDB.open(dbName, dbVersion);

    let INDEXEDDBMETADATA = (window as any)[
      "__INDEXEDDB_METADATA__"
    ] as DBMetadataArgs;
    console.log(INDEXEDDBMETADATA);
    // 第一次或者版本升级时执行，根据配置信息建立对象仓库，之后会调用onSuccess
    dbRequest.onupgradeneeded = (event) => {
      // 获取上一般版本的数据库
      const db = (event.target as any).result;
      // 获取DBMetadataArgs判断是否需要清楚
      for (const store of INDEXEDDBMETADATA.getDBMetaObjectStores() as StoreOptions[]) {
        // 已有仓库，验证是否需要删除原来的
        if (db.objectStoreNames.contains(store.name) || store.isClear) {
          // 删除原对象仓库
          db.deleteObjectStore(store.name);
        }
        console.log("store数据", store);
        // 建立新对象仓库
        const objectStore: IDBObjectStore = db.createObjectStore(store.name, {
          keyPath: store.primaryField.name,
          autoIncrement: store.primaryField.autoIncrement,
        });
        // 创建索引
        for (const field in store.fields) {
          let { index, unique = false } = store.fields[field];
          index &&
            objectStore.createIndex(field, field, {
              unique,
            });
        }
      }
    };

    // 数据库打开成功，记录连接对象
    dbRequest.onsuccess = (event) => {
      console.log("数据库打开成功");
      _db = (event.target as any).result as IDBDatabase;
      if (INDEXEDDBMETADATA) {
        INDEXEDDBMETADATA.status = true;
        INDEXEDDBMETADATA.setDBMetaDataBase(_db);
        //删除全局变量
        (window as any)["__INDEXEDDB_METADATA__"] = null;
      }

      // 对返回数据进行二次处理
      // reTreatment(INDEXEDDBMETADATA,_db)

      resolve({
        db: _db,
        getRepository: _getRepository(_db),
      });
    };

    // 错误情况
    dbRequest.onerror = (event) => {
      console.error("打开IndexedDB数据库失败", (event.target as any).error);
      reject("打开IndexedDB数据库失败" + (event.target as any).error);
    };
  });
}
