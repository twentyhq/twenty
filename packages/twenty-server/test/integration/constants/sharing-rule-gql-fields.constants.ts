import {
  ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS,
  ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS,
} from 'test/integration/constants/row-level-permission-predicate-gql-fields.constants';

export const SHARING_RULE_PREDICATE_GQL_FIELDS = `
    ${ROW_LEVEL_PERMISSION_PREDICATE_GQL_FIELDS}
    sharingRuleId
`;

export const SHARING_RULE_PREDICATE_GROUP_GQL_FIELDS = `
    ${ROW_LEVEL_PERMISSION_PREDICATE_GROUP_GQL_FIELDS}
    sharingRuleId
`;

export const SHARING_RULE_GQL_FIELDS = `
    id
    universalIdentifier
    applicationId
    objectMetadataId
    name
    description
    granteePrincipalType
    granteePrincipalId
    granteeRoleId
    accessLevel
    isActive
    rowLevelPermissionPredicates {
      ${SHARING_RULE_PREDICATE_GQL_FIELDS}
    }
    rowLevelPermissionPredicateGroups {
      ${SHARING_RULE_PREDICATE_GROUP_GQL_FIELDS}
    }
`;
