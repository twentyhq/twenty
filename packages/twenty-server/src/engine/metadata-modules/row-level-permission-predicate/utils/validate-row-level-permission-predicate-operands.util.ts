/* @license Enterprise */

import { type ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  isFilterOperandAvailableForFieldType,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type RowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';

export const validateRowLevelPermissionPredicateOperandsOrThrow = ({
  predicates,
  flatFieldMetadataMaps,
}: {
  predicates: RowLevelPermissionPredicateInput[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): void => {
  for (const predicate of predicates) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: predicate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      continue;
    }

    if (
      !isFilterOperandAvailableForFieldType({
        fieldType: fieldMetadata.type,
        operand: predicate.operand as unknown as ViewFilterOperand,
        subFieldName: predicate.subFieldName,
      })
    ) {
      throw new RowLevelPermissionPredicateException(
        `Operand ${predicate.operand} is not supported for field ${fieldMetadata.name} of type ${fieldMetadata.type}`,
        RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      );
    }
  }
};
