// `undefined`: the value reads something its reader cannot read, so the computed column is null
export type ReadableSql<TSql> = TSql | undefined;
