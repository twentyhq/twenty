/* @license Enterprise */

export type AccessGroupMemberFieldValue = string | number | boolean | null;

export type AccessGroupMemberFieldValues = Record<
  string,
  AccessGroupMemberFieldValue
>;

export type AccessGroupDefinition = {
  groupHash: string;
  roleId: string;
  objectMetadataId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  memberFieldValues: AccessGroupMemberFieldValues | null;
};
