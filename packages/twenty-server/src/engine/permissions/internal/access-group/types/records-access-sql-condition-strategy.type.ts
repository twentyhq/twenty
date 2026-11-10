export type RecordsAccessSQLConditionStrategy =
  | 'accessGroups'
  | 'withoutRowLevelPermissions'
  // Writes keep the RLS condition in their statement so the check and the write are atomic
  | 'rowLevelPermissionsInWrite'
  // TODO: remove once reads through joins and RLS on limiting roles can use access groups
  | 'degradedRead';
