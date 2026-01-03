/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRowLevelPermissionPredicateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatRowLevelPermissionPredicateValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-row-level-permission-predicate-validator.service';

@Injectable()
export class WorkspaceMigrationV2RowLevelPermissionPredicateActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
> {
  constructor(
    private readonly flatRowLevelPermissionPredicateValidatorService: FlatRowLevelPermissionPredicateValidatorService,
  ) {
    super(ALL_METADATA_NAME.rowLevelPermissionPredicate);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate,
    'create'
  > {
    const validationResult =
      this.flatRowLevelPermissionPredicateValidatorService.validateFlatRowLevelPermissionPredicateCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'rowLevelPermissionPredicate',
        flatEntity: flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate,
    'delete'
  > {
    const validationResult =
      this.flatRowLevelPermissionPredicateValidatorService.validateFlatRowLevelPermissionPredicateDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: { id: predicateId },
    } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'rowLevelPermissionPredicate',
        entityId: predicateId,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate,
    'update'
  > {
    const validationResult =
      this.flatRowLevelPermissionPredicateValidatorService.validateFlatRowLevelPermissionPredicateUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateAction: UpdateRowLevelPermissionPredicateAction = {
      type: 'update',
      metadataName: 'rowLevelPermissionPredicate',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
