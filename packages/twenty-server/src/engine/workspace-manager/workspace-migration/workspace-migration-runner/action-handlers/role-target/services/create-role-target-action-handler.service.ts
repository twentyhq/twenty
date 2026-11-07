import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateRoleTargetAction,
  UniversalCreateRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'roleTarget',
) {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
    preallocatedIdByUniversalIdentifierByMetadataName,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateRoleTargetAction>): Promise<FlatCreateRoleTargetAction> {
    const { roleId, agentId, webhookId } =
      resolveUniversalRelationIdentifiersToIds({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: action.metadataName,
        universalForeignKeyValues: action.flatEntity,
        preallocatedIdByUniversalIdentifierByMetadataName,
      });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'roleTarget',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        roleId,
        agentId,
        webhookId,
        targetApplicationId: await this.resolveTargetApplicationId({
          workspaceId,
          targetApplicationUniversalIdentifier:
            action.flatEntity.targetApplicationUniversalIdentifier,
        }),
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  private async resolveTargetApplicationId({
    workspaceId,
    targetApplicationUniversalIdentifier,
  }: {
    workspaceId: string;
    targetApplicationUniversalIdentifier: string | null;
  }): Promise<string | null> {
    if (!isDefined(targetApplicationUniversalIdentifier)) {
      return null;
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const targetFlatApplication =
      findActiveFlatApplicationByUniversalIdentifier(
        flatApplicationMaps,
        targetApplicationUniversalIdentifier,
      );

    if (!isDefined(targetFlatApplication)) {
      throw new WorkspaceMigrationRunnerException({
        message: `Could not find target application with universal identifier: ${targetApplicationUniversalIdentifier}`,
        code: WorkspaceMigrationRunnerExceptionCode.APPLICATION_NOT_FOUND,
      });
    }

    return targetFlatApplication.id;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateRoleTargetAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
