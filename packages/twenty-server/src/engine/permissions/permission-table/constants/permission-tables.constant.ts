/* @license Enterprise */

type PermissionTable = {
  tableName: string;
  columnNames: string[];
  jsonColumnNames: string[];
  identityColumnName?: string;
};

export const PERMISSION_TABLES: PermissionTable[] = [
  {
    tableName: 'recordShare',
    columnNames: [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'recordId',
      'objectMetadataId',
      'principalId',
      'principalType',
      'accessLevel',
      'rowCause',
      'sourceId',
    ],
    jsonColumnNames: [],
  },
  {
    tableName: 'accessGroup',
    columnNames: [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'objectMetadataId',
      'roleId',
      'rowLevelPermissionPredicateGroupId',
      'memberFieldValues',
      'groupHash',
      'compactId',
    ],
    jsonColumnNames: ['memberFieldValues'],
    identityColumnName: 'compactId',
  },
];
