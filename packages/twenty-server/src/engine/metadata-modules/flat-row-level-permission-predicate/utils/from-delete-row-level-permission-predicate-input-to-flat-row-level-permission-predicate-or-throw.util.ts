/* @license Enterprise */

import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DeleteRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/delete-row-level-permission-predicate.input';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromDeleteRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateOrThrow =
  ({
    deleteRowLevelPermissionPredicateInput:
      rawDeleteRowLevelPermissionPredicateInput,
    flatRowLevelPermissionPredicateMaps,
  }: {
    deleteRowLevelPermissionPredicateInput: DeleteRowLevelPermissionPredicateInput;
    flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  }): FlatRowLevelPermissionPredicate => {
    const { id: predicateId } = extractAndSanitizeObjectStringFields(
      rawDeleteRowLevelPermissionPredicateInput,
      ['id'],
    );

    const existingFlatPredicate =
      flatRowLevelPermissionPredicateMaps.byId[predicateId];

    if (!isDefined(existingFlatPredicate)) {
      throw new RowLevelPermissionPredicateException(
        t`Row level permission predicate to delete not found`,
        RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND,
      );
    }

    return {
      ...existingFlatPredicate,
      deletedAt: new Date().toISOString(),
    };
  };
