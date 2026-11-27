/* @license Enterprise */

import {
  FieldMetadataType,
  RelationType,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const isRlsOneToManyEmptinessPredicate = ({
  predicate,
  fieldMetadata,
}: {
  predicate: Pick<
    RowLevelPermissionPredicate,
    'operand' | 'relationFieldMetadataId'
  >;
  fieldMetadata: OrmFlatFieldMetadata;
}): boolean =>
  isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) &&
  fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY &&
  !isDefined(predicate.relationFieldMetadataId) &&
  (predicate.operand === RowLevelPermissionPredicateOperand.IS_EMPTY ||
    predicate.operand === RowLevelPermissionPredicateOperand.IS_NOT_EMPTY);
