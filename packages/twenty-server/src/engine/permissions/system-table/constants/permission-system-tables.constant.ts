/* @license Enterprise */

export const PERMISSION_SYSTEM_TABLES = [
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
  },
];
