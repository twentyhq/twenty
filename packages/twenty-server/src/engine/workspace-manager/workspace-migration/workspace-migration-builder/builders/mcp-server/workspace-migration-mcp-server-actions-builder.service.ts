import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateMcpServerAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/mcp-server/types/workspace-migration-mcp-server-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatMcpServerValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-mcp-server-validator.service';

@Injectable()
export class WorkspaceMigrationMcpServerActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.mcpServer
> {
  constructor(
    private readonly flatMcpServerValidatorService: FlatMcpServerValidatorService,
  ) {
    super(ALL_METADATA_NAME.mcpServer);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.mcpServer>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.mcpServer,
    'create'
  > {
    const validationResult =
      this.flatMcpServerValidatorService.validateFlatMcpServerCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'mcpServer',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.mcpServer>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.mcpServer,
    'delete'
  > {
    const validationResult =
      this.flatMcpServerValidatorService.validateFlatMcpServerDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'mcpServer',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.mcpServer>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.mcpServer,
    'update'
  > {
    const validationResult =
      this.flatMcpServerValidatorService.validateFlatMcpServerUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateMcpServerAction: UniversalUpdateMcpServerAction = {
      type: 'update',
      metadataName: 'mcpServer',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateMcpServerAction,
    };
  }
}
