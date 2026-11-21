import { type RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

export type WorkspaceMemberIndividualRoleRule = {
  ruleKey: string;
  objectMetadataId: string;
  fieldMetadataId: string;
  relationFieldMetadataId: string | null;
  operand: RowLevelPermissionPredicateOperand;
  value: string[];
  unreadableFieldMetadataIds: string[];
};

export type WorkspaceMemberIndividualRole = {
  userWorkspaceId: string;
  rules: WorkspaceMemberIndividualRoleRule[];
};
