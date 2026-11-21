/* @license Enterprise */

import { type RowLevelPermissionPredicate } from 'twenty-shared/types';

export const buildLiteralValuePredicateKey = ({
  relationFieldMetadataId,
  fieldMetadataId,
  subFieldName,
}: Pick<
  RowLevelPermissionPredicate,
  'relationFieldMetadataId' | 'fieldMetadataId' | 'subFieldName'
>): string =>
  [relationFieldMetadataId ?? '', fieldMetadataId, subFieldName ?? ''].join(
    ':',
  );
