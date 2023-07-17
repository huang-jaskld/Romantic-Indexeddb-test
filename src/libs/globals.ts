import DBMetadataArgs from "./decorator/metedata-args/DBMetadataArgs";

/**
 * 获取全局存储
 * @returns
 */
export function getMetadataArgsStorage() {
  let globalScope: DBMetadataArgs | null = (window as any)[
    "__INDEXEDDB_METADATA__"
  ];
  if (!globalScope || globalScope.status === true) {
    globalScope = new DBMetadataArgs();
    (window as any)["__INDEXEDDB_METADATA__"] = globalScope;
  }
  return globalScope;
}
