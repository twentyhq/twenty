export type RecordsAccessSQLConditionStrategy =
  | 'accessGroups'
  | 'withoutRowLevelPermissionsAndInheritance'
  // TODO: remove once writes, joins and RLS on limiting roles no longer render RLS in the query
  | 'degraded';
