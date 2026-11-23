export const ROW_LEVEL_PERMISSION_RULE_GQL_FIELDS = `
    id
    objectMetadataId
    canCreateRecords
    canReadRecords
    canUpdateRecords
    canSoftDeleteRecords
    canDestroyRecords
`;

export const ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS = `
    id
    fieldMetadataId
    relationFieldMetadataId
    objectMetadataId
    operand
    value
    subFieldName
    workspaceMemberFieldMetadataId
    workspaceMemberSubFieldName
    rowLevelPermissionPredicateGroupId
    rowLevelPermissionRuleId
    positionInRowLevelPermissionPredicateGroup
    roleId
`;

export const ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS = `
    id
    parentRowLevelPermissionPredicateGroupId
    rowLevelPermissionRuleId
    logicalOperator
    positionInRowLevelPermissionPredicateGroup
    canReadRecords
    canUpdateRecords
    canSoftDeleteRecords
    canDestroyRecords
    roleId
    objectMetadataId
`;
