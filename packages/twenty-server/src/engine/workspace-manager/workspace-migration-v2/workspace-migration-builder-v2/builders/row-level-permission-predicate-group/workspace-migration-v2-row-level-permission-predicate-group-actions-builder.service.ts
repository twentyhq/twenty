/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRowLevelPermissionPredicateGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatRowLevelPermissionPredicateGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-row-level-permission-predicate-group-validator.service';

@Injectable()
export class WorkspaceMigrationV2RowLevelPermissionPredicateGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
> {
  constructor(
    private readonly flatRowLevelPermissionPredicateGroupValidatorService: FlatRowLevelPermissionPredicateGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.rowLevelPermissionPredicateGroup);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup,
    'create'
  > {
    const validationResult =
      this.flatRowLevelPermissionPredicateGroupValidatorService.validateFlatRowLevelPermissionPredicateGroupCreation(
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
        metadataName: 'rowLevelPermissionPredicateGroup',
        flatEntity: flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup,
    'delete'
  > {
    const validationResult =
      this.flatRowLevelPermissionPredicateGroupValidatorService.validateFlatRowLevelPermissionPredicateGroupDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: { id: predicateGroupId },
    } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'rowLevelPermissionPredicateGroup',
        entityId: predicateGroupId,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup,
    'update'
  > {
    const validationResult =
      this.flatRowLevelPermissionPredicateGroupValidatorService.validateFlatRowLevelPermissionPredicateGroupUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateAction: UpdateRowLevelPermissionPredicateGroupAction = {
      type: 'update',
      metadataName: 'rowLevelPermissionPredicateGroup',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
