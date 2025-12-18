/* @license Enterprise */

import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-row-level-permission-predicate-group/constants/flat-row-level-permission-predicate-group-editable-properties.constant';
import { type UpdateRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/update-row-level-permission-predicate-group.input';
import {
  RowLevelPermissionPredicateGroupException,
  RowLevelPermissionPredicateGroupExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate-group.exception';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupToUpdateOrThrow =
  ({
    updateRowLevelPermissionPredicateGroupInput:
      rawUpdateRowLevelPermissionPredicateGroupInput,
    flatRowLevelPermissionPredicateGroupMaps,
  }: {
    updateRowLevelPermissionPredicateGroupInput: UpdateRowLevelPermissionPredicateGroupInput;
    flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  }): FlatRowLevelPermissionPredicateGroup => {
    const { id: predicateGroupId } =
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
        rawUpdateRowLevelPermissionPredicateGroupInput,
        ['id'],
      );

    const existingFlatPredicateGroup =
      flatRowLevelPermissionPredicateGroupMaps.byId[predicateGroupId];

    if (!isDefined(existingFlatPredicateGroup)) {
      throw new RowLevelPermissionPredicateGroupException(
        t`Row level permission predicate group to update not found`,
        RowLevelPermissionPredicateGroupExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND,
      );
    }

    const sanitizedUpdate = extractAndSanitizeObjectStringFields(
      rawUpdateRowLevelPermissionPredicateGroupInput,
      FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES,
    );

    return mergeUpdateInExistingRecord({
      existing: existingFlatPredicateGroup,
      properties: FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES,
      update: sanitizedUpdate,
    });
  };
