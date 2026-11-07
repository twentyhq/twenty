/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';

export const buildAccessGroupMemberFieldKey = ({
  workspaceMemberFieldMetadataId,
  workspaceMemberSubFieldName,
}: Pick<
  RowLevelPermissionPredicate,
  'workspaceMemberFieldMetadataId' | 'workspaceMemberSubFieldName'
>): string =>
  `${workspaceMemberFieldMetadataId}:${workspaceMemberSubFieldName ?? ''}`;
