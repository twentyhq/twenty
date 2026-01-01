/* @license Enterprise */

import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type DestroyRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/destroy-row-level-permission-predicate-group.input';
import {
  RowLevelPermissionPredicateGroupException,
  RowLevelPermissionPredicateGroupExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate-group.exception';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromDestroyRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupOrThrow =
  ({
    destroyRowLevelPermissionPredicateGroupInput:
      rawDestroyRowLevelPermissionPredicateGroupInput,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    destroyRowLevelPermissionPredicateGroupInput: DestroyRowLevelPermissionPredicateGroupInput;
    flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  }): FlatRowLevelPermissionPredicateGroup => {
    const { id: predicateGroupId } = extractAndSanitizeObjectStringFields(
      rawDestroyRowLevelPermissionPredicateGroupInput,
      ['id'],
    );

    const existingFlatPredicateGroup =
      flatRowLevelPermissionPredicateGroupMaps.byId[predicateGroupId];

    if (!isDefined(existingFlatPredicateGroup)) {
      throw new RowLevelPermissionPredicateGroupException(
        t`Row level permission predicate group to destroy not found`,
        RowLevelPermissionPredicateGroupExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND,
      );
    }

    return existingFlatPredicateGroup;
  };
