import { type RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

export type WorkspaceMemberIndividualRoleRule = {
  ruleKey: string;
  objectMetadataUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  relationFieldMetadataUniversalIdentifier: string | null;
  operand: RowLevelPermissionPredicateOperand;
  value: string[];
  unreadableFieldMetadataUniversalIdentifiers: string[];
};

export type WorkspaceMemberIndividualRole = {
  userWorkspaceId: string;
  rules: WorkspaceMemberIndividualRoleRule[];
};
