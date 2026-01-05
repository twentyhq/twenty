export const VIEW_GQL_FIELDS = `
    id
    name
    objectMetadataId
    type
    key
    mainGroupByFieldMetadataId
    icon
    position
    isCompact
    openRecordIn
    workspaceId
    anyFieldFilterValue
    createdAt
    updatedAt
    deletedAt
`;

export const VIEW_FIELD_GQL_FIELDS = `
    id
    fieldMetadataId
    position
    isVisible
    size
    viewId
    createdAt
    updatedAt
    deletedAt
`;

export const VIEW_SORT_GQL_FIELDS = `
    id
    fieldMetadataId
    direction
    viewId
    createdAt
    updatedAt
    deletedAt
`;

export const VIEW_FILTER_GQL_FIELDS = `
    id
    fieldMetadataId
    operand
    value
    viewId
    createdAt
    updatedAt
    deletedAt
`;

export const VIEW_GROUP_GQL_FIELDS = `
    id
    fieldValue
    isVisible
    position
    viewId
    createdAt
    updatedAt
    deletedAt
`;

export const VIEW_FILTER_GROUP_GQL_FIELDS = `
    id
    logicalOperator
    parentViewFilterGroupId
    positionInViewFilterGroup
    viewId
    createdAt
    updatedAt
    deletedAt
`;
