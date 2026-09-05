import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateSharingRuleAction,
  UniversalCreateSharingRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/sharing-rule/types/workspace-migration-sharing-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateSharingRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'sharingRule',
) {
  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateSharingRuleAction>): Promise<FlatCreateSharingRuleAction> {
    const { objectMetadataId, granteeRoleId } =
      resolveUniversalRelationIdentifiersToIds({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: action.metadataName,
        universalForeignKeyValues: action.flatEntity,
      });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'sharingRule',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        objectMetadataId,
        granteeRoleId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        rowLevelPermissionPredicateIds: [],
        rowLevelPermissionPredicateGroupIds: [],
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateSharingRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatAction.flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateSharingRuleAction>,
  ): Promise<void> {
    return;
  }
}
