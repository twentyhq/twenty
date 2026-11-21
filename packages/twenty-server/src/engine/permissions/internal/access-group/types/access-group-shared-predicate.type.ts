/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';

export type AccessGroupSharedPredicate = Pick<
  RowLevelPermissionPredicate,
  | 'objectMetadataId'
  | 'relationFieldMetadataId'
  | 'fieldMetadataId'
  | 'subFieldName'
  | 'operand'
> & {
  value: string;
  unreadableFieldIds: string[];
};
