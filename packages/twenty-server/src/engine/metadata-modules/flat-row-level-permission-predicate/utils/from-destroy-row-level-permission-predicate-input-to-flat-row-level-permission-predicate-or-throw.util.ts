/* @license Enterprise */

import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DestroyRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/destroy-row-level-permission-predicate.input';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromDestroyRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow =
  ({
    destroyRowLevelPermissionPredicateInput:
      rawDestroyRowLevelPermissionPredicateInput,
    flatRowLevelPermissionPredicateMaps,
  }: {
    destroyRowLevelPermissionPredicateInput: DestroyRowLevelPermissionPredicateInput;
    flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  }): FlatRowLevelPermissionPredicate => {
    const { id: predicateId } = extractAndSanitizeObjectStringFields(
      rawDestroyRowLevelPermissionPredicateInput,
      ['id'],
    );

    const existingFlatPredicate =
      flatRowLevelPermissionPredicateMaps.byId[predicateId];

    if (!isDefined(existingFlatPredicate)) {
      throw new RowLevelPermissionPredicateException(
        t`Row level permission predicate to destroy not found`,
        RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND,
      );
    }

    return existingFlatPredicate;
  };
