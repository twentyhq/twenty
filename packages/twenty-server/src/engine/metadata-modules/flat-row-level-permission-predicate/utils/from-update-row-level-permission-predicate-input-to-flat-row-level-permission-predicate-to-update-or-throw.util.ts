/* @license Enterprise */

import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/constants/flat-row-level-permission-predicate-editable-properties.constant';
import { type UpdateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate.input';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToUpdateOrThrow =
  ({
    updateRowLevelPermissionPredicateInput:
      rawUpdateRowLevelPermissionPredicateInput,
    flatRowLevelPermissionPredicateMaps,
  }: {
    updateRowLevelPermissionPredicateInput: UpdateRowLevelPermissionPredicateInput;
    flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  }): FlatRowLevelPermissionPredicate => {
    const { id: predicateId } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateRowLevelPermissionPredicateInput,
        ['id'],
      );

    const existingFlatPredicate =
      flatRowLevelPermissionPredicateMaps.byId[predicateId];

    if (!isDefined(existingFlatPredicate)) {
      throw new RowLevelPermissionPredicateException(
        t`Row level permission predicate to update not found`,
        RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND,
      );
    }

    const sanitizedUpdate = extractAndSanitizeObjectStringFields(
      rawUpdateRowLevelPermissionPredicateInput,
      FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES,
    );

    return mergeUpdateInExistingRecord({
      existing: existingFlatPredicate,
      properties: FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES,
      update: sanitizedUpdate,
    });
  };
