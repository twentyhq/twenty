/* @license Enterprise */

import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateRowLevelPermissionPredicateInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/create-row-level-permission-predicate.input';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromCreateRowLevelPermissionPredicateInputToFlatRowLevelPermissionPredicateToCreate =
  ({
    createRowLevelPermissionPredicateInput:
      rawCreateRowLevelPermissionPredicateInput,
    workspaceId,
  }: {
    createRowLevelPermissionPredicateInput: CreateRowLevelPermissionPredicateInput;
    workspaceId: string;
  }): FlatRowLevelPermissionPredicate => {
    const sanitizedInput = (
      trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties as unknown as (
        input: CreateRowLevelPermissionPredicateInput,
        keys: string[],
      ) => CreateRowLevelPermissionPredicateInput
    )(rawCreateRowLevelPermissionPredicateInput, [
      'fieldMetadataId',
      'objectMetadataId',
      'roleId',
      'rowLevelPermissionPredicateGroupId',
      'workspaceMemberFieldMetadataId',
      'subFieldName',
      'workspaceMemberSubFieldName',
      'operand',
    ]);

    const {
      fieldMetadataId,
      objectMetadataId,
      roleId,
      value,
      ...createRowLevelPermissionPredicateInput
    } = sanitizedInput;

    const createdAt = new Date().toISOString();
    const predicateId = v4();

    return {
      id: predicateId,
      fieldMetadataId,
      objectMetadataId,
      roleId,
      workspaceId,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: predicateId,
      operand: createRowLevelPermissionPredicateInput.operand,
      value: value,
      rowLevelPermissionPredicateGroupId:
        createRowLevelPermissionPredicateInput.rowLevelPermissionPredicateGroupId ??
        null,
      positionInRowLevelPermissionPredicateGroup:
        createRowLevelPermissionPredicateInput.positionInRowLevelPermissionPredicateGroup ??
        null,
      subFieldName: createRowLevelPermissionPredicateInput.subFieldName ?? null,
      workspaceMemberFieldMetadataId:
        createRowLevelPermissionPredicateInput.workspaceMemberFieldMetadataId ??
        null,
      workspaceMemberSubFieldName:
        createRowLevelPermissionPredicateInput.workspaceMemberSubFieldName ??
        null,
      applicationId: null,
    };
  };
