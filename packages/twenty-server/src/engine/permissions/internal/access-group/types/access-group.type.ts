/* @license Enterprise */

import { type RowLevelPermissionPredicateValue } from 'twenty-shared/types';

export type AccessGroupMemberFieldValue = Exclude<
  RowLevelPermissionPredicateValue,
  string[]
>;

export type AccessGroupMemberFieldValues = Record<
  string,
  AccessGroupMemberFieldValue
>;

export type AccessGroup = {
  compactId: number;
  groupHash: string;
  roleId: string;
  objectMetadataId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: AccessGroupMemberFieldValues | null;
};

export type AccessGroupWithoutCompactId = Omit<AccessGroup, 'compactId'>;
