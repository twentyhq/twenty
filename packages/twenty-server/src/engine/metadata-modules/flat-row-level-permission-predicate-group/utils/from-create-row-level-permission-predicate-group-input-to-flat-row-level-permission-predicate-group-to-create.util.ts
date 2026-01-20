/* @license Enterprise */

import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateRowLevelPermissionPredicateGroupInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate-group.input';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromCreateRowLevelPermissionPredicateGroupInputToFlatRowLevelPermissionPredicateGroupToCreate =
  ({
    createRowLevelPermissionPredicateGroupInput:
      rawCreateRowLevelPermissionPredicateGroupInput,
    workspaceId,
    workspaceCustomApplicationId,
  }: {
    createRowLevelPermissionPredicateGroupInput: CreateRowLevelPermissionPredicateGroupInput;
    workspaceId: string;
    workspaceCustomApplicationId: string;
  }): FlatRowLevelPermissionPredicateGroup => {
    const sanitizedInput = (
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties as unknown as (
        input: CreateRowLevelPermissionPredicateGroupInput,
        keys: string[],
      ) => CreateRowLevelPermissionPredicateGroupInput
    )(rawCreateRowLevelPermissionPredicateGroupInput, [
      'roleId',
      'objectMetadataId',
      'parentRowLevelPermissionPredicateGroupId',
      'logicalOperator',
    ]);

    const {
      roleId,
      objectMetadataId,
      ...createRowLevelPermissionPredicateGroupInput
    } = sanitizedInput;

    const createdAt = new Date().toISOString();
    const predicateGroupId = v4();

    return {
      id: predicateGroupId,
      workspaceId,
      roleId,
      objectMetadataId,
      childRowLevelPermissionPredicateGroupIds: [],
      rowLevelPermissionPredicateIds: [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: predicateGroupId,
      parentRowLevelPermissionPredicateGroupId:
        createRowLevelPermissionPredicateGroupInput.parentRowLevelPermissionPredicateGroupId ??
        null,
      logicalOperator:
        createRowLevelPermissionPredicateGroupInput.logicalOperator,
      positionInRowLevelPermissionPredicateGroup:
        createRowLevelPermissionPredicateGroupInput.positionInRowLevelPermissionPredicateGroup ??
        null,
      applicationId: workspaceCustomApplicationId,
    };
  };
