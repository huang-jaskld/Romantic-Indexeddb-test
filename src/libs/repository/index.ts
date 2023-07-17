type queryParams_T = IDBValidKey | IDBKeyRange;

// 将方法封装成Promise类型
function promisic(fn: Function) {
  return (...args: Array<any>): Promise<any> => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      let request: IDBRequest = fn.apply(this, args);
      request.onsuccess = (event) => resolve(event);
      request.onerror = (error) => reject(error);
    });
  };
}

// 删除对象中值为undefined或null的属性
function deleteUnreasonableKey(param: { [k: string]: any }) {
  let temp = { ...param };
  Object.keys(temp).forEach((value) => {
    if (temp[value] === null || temp[value] === undefined) {
      delete temp[value];
    }
  });
  return temp;
}

export class RepositoryReadonly {
  store: IDBObjectStore;

  constructor(store: IDBObjectStore) {
    this.store = store;
  }

  /**
   * 通过主键判断是否该记录是否存在
   */
  async hasByKeyPath(query: queryParams_T) {
    const event = await this.getByKeyPath(query);
    if (event.target.result) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 返回与提供的键或 IDBKeyRange符合的数据
   * 如果未提供参数，则返回存储中的所有记录总数
   */

  count(query?: queryParams_T) {
    return promisic.call(this.store, this.store.count)(query);
  }

  /**
   * 获取一条记录
   */
  getByKeyPath(query: queryParams_T) {
    return promisic.call(this.store, this.store.get)(query);
  }

  /**
   * 获取多条记录
   */
  getAllByKeyPath(query?: queryParams_T, count?: number) {
    return promisic.call(this.store, this.store.getAll)(query, count);
  }

  /**
   * 根据index获取记录
   */
  getAllByIndex(
    indexName: string,
    query: queryParams_T | ((currentVal: any) => boolean)
  ) {
    return new Promise((resolve, reject) => {
      const index = this.store.index(indexName); // 获取索引
      let request: IDBRequest;
      if (typeof query === "function") {
        let res: Object[] = [];
        request = index.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as any).result as IDBCursorWithValue;
          if (cursor) {
            query(cursor.value) && res.push(cursor.value);
            cursor.continue();
          }
          resolve(res);
        };
        request.onerror = (event) => {
          reject("开启索引失败" + (event as any).error);
        };
      } else {
        request = index.getAll(query);
        request.onsuccess = (event) => {
          resolve((event.target as any).result);
        };
        request.onerror = (event) => {
          reject((event as any).error);
        };
      }
    });
  }

  /**
   * 获取主键
   */
  getKey(query: queryParams_T) {
    return promisic.call(this.store, this.store.getKey)(query);
  }

  /**
   * 获取多个主键
   */
  getAllKey(query?: queryParams_T, count?: number) {
    return promisic.call(this.store, this.store.getAllKeys)(query, count);
  }
}

/** ************************************************************************* */

export class RepositoryWrite extends RepositoryReadonly {
  constructor(store: IDBObjectStore) {
    super(store);
  }

  /**
   * 删除对象仓库中的所有数据
   */
  clear() {
    return promisic.call(this.store, this.store.clear)();
  }

  /**
   * 删除记录
   */
  delete(query: queryParams_T) {
    return promisic.call(this.store, this.store.count)(query);
  }

  /**
   * 添加数据
   */
  add(rowData: Object) {
    return promisic.call(
      this.store,
      this.store.add
    )(deleteUnreasonableKey(rowData));
  }

  /**
   * 将数据存储到对象仓库中，如果出现主键重复的情况则进行覆盖
   */
  save(...rowDatas: Object[]) {
    // 判断传入的数据长度
    let length = rowDatas.length;
    let fns: Promise<any>[] = [];
    debugger;
    for (let i = 0; i < length; i++) {
      fns.push(
        promisic.call(
          this.store,
          this.store.put
        )(deleteUnreasonableKey(rowDatas[i]))
      );
    }

    return Promise.all(fns);
  }
}

export function _getRepository(dataBase: IDBDatabase) {
  return function (
    storeClass: Object,
    type: "readwrite" | "readonly" = "readonly"
  ) {
    // 1. 判断传入的类，类名是否存在数据库中
    console.log(typeof storeClass, storeClass);
    let storeName = (storeClass as any).name;
    console.log(dataBase.objectStoreNames.contains(storeName));
    console.log(typeof storeName);
    if (!dataBase.objectStoreNames.contains(storeName))
      throw new Error(`IndexedDB中不存在名为${storeName}的对象仓库`);
    // 2. 开启业务
    const store = dataBase.transaction(storeName, type).objectStore(storeName);
    // 3. 用Repository进行封装
    if (type === "readonly") {
      return new RepositoryReadonly(store);
    } else {
      return new RepositoryWrite(store) as RepositoryWrite;
    }
  };
}
