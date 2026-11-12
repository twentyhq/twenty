/* @license Enterprise */

import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export type AccessGroup = {
  compactId: number;
  groupHash: string;
  roleId: string;
  objectMetadataId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: RlsMemberFieldValues | null;
};

export type AccessGroupWithoutCompactId = Omit<AccessGroup, 'compactId'>;
