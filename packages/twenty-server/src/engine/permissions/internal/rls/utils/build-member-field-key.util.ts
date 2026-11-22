/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildMemberFieldKey = ({
  workspaceMemberFieldMetadataId,
  workspaceMemberSubFieldName,
  workspaceMemberRelationFieldMetadataId,
}: Pick<
  RowLevelPermissionPredicate,
  | 'workspaceMemberFieldMetadataId'
  | 'workspaceMemberSubFieldName'
  | 'workspaceMemberRelationFieldMetadataId'
>): string => {
  const memberFieldKey = `${workspaceMemberFieldMetadataId}:${workspaceMemberSubFieldName ?? ''}`;

  if (!isDefined(workspaceMemberRelationFieldMetadataId)) {
    return memberFieldKey;
  }

  return `${workspaceMemberRelationFieldMetadataId}>${memberFieldKey}`;
};
