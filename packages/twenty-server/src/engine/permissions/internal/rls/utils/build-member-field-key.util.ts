/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildMemberFieldKey = ({
  workspaceMemberFieldMetadataId,
  workspaceMemberSubFieldName,
  workspaceMemberRelationFieldMetadataId,
  workspaceMemberRelationFilterFieldMetadataId,
  workspaceMemberRelationFilterValues,
}: Pick<
  RowLevelPermissionPredicate,
  | 'workspaceMemberFieldMetadataId'
  | 'workspaceMemberSubFieldName'
  | 'workspaceMemberRelationFieldMetadataId'
  | 'workspaceMemberRelationFilterFieldMetadataId'
  | 'workspaceMemberRelationFilterValues'
>): string => {
  const memberFieldKey = `${workspaceMemberFieldMetadataId}:${workspaceMemberSubFieldName ?? ''}`;

  if (!isDefined(workspaceMemberRelationFieldMetadataId)) {
    return memberFieldKey;
  }

  if (!isDefined(workspaceMemberRelationFilterFieldMetadataId)) {
    return `${workspaceMemberRelationFieldMetadataId}>${memberFieldKey}`;
  }

  const sortedFilterValues = JSON.stringify(
    [...(workspaceMemberRelationFilterValues ?? [])].sort(),
  );

  return `${workspaceMemberRelationFieldMetadataId}[${workspaceMemberRelationFilterFieldMetadataId}=${sortedFilterValues}]>${memberFieldKey}`;
};
