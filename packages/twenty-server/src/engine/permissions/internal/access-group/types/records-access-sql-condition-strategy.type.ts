export type RecordsAccessSQLConditionStrategy =
  | 'accessGroups'
  | 'withoutRowLevelPermissions'
  // TODO: remove once reads through joins and RLS on limiting roles can use access groups
  | 'degradedRead';
