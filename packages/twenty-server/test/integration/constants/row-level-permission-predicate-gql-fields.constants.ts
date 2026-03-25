export const ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS = `
    id
    fieldMetadataId
    objectMetadataId
    operand
    value
    subFieldName
    workspaceMemberFieldMetadataId
    workspaceMemberSubFieldName
    rowLevelPermissionPredicateGroupId
    positionInRowLevelPermissionPredicateGroup
    roleId
`;

export const ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS = `
    id
    parentRowLevelPermissionPredicateGroupId
    logicalOperator
    positionInRowLevelPermissionPredicateGroup
    roleId
    objectMetadataId
`;
