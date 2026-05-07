import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import {
  type FlatCreatePermissionFlagDefinitionAction,
  type UniversalCreatePermissionFlagDefinitionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-definition/types/workspace-migration-permission-flag-definition-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePermissionFlagDefinitionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'permissionFlagDefinition',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreatePermissionFlagDefinitionAction>): Promise<FlatCreatePermissionFlagDefinitionAction> {
    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'permissionFlagDefinition',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreatePermissionFlagDefinitionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreatePermissionFlagDefinitionAction>,
  ): Promise<void> {
    return;
  }
}
