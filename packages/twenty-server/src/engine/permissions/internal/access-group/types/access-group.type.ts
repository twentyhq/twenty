/* @license Enterprise */

import { type RowLevelPermissionMemberFieldValues } from 'src/engine/permissions/internal/rls/types/row-level-permission-member-field-values.type';

export type AccessGroup = {
  compactId: number;
  groupHash: string;
  roleId: string;
  objectMetadataId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: RowLevelPermissionMemberFieldValues | null;
};

export type AccessGroupWithoutCompactId = Omit<AccessGroup, 'compactId'>;
