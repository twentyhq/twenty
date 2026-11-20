/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildMemberFieldKey = ({
  workspaceMemberFieldMetadataId,
  workspaceMemberSubFieldName,
  workspaceMemberRelationFieldMetadataId,
  workspaceMemberRelationFilterFieldMetadataId,
  workspaceMemberRelationFilterValue,
}: Pick<
  RowLevelPermissionPredicate,
  | 'workspaceMemberFieldMetadataId'
  | 'workspaceMemberSubFieldName'
  | 'workspaceMemberRelationFieldMetadataId'
  | 'workspaceMemberRelationFilterFieldMetadataId'
  | 'workspaceMemberRelationFilterValue'
>): string => {
  const memberFieldKey = `${workspaceMemberFieldMetadataId}:${workspaceMemberSubFieldName ?? ''}`;

  if (!isDefined(workspaceMemberRelationFieldMetadataId)) {
    return memberFieldKey;
  }

  const filterKey = isDefined(workspaceMemberRelationFilterFieldMetadataId)
    ? `?${workspaceMemberRelationFilterFieldMetadataId}=${JSON.stringify(workspaceMemberRelationFilterValue ?? null)}`
    : '';

  return `${workspaceMemberRelationFieldMetadataId}>${memberFieldKey}${filterKey}`;
};
