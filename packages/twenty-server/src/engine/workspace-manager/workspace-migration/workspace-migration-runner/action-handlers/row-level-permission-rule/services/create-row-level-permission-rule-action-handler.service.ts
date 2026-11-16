/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateRowLevelPermissionRuleAction,
  UniversalCreateRowLevelPermissionRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-rule/types/workspace-migration-row-level-permission-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRowLevelPermissionRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'rowLevelPermissionRule',
) {
  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateRowLevelPermissionRuleAction>): Promise<FlatCreateRowLevelPermissionRuleAction> {
    const { objectMetadataId, roleId } =
      resolveUniversalRelationIdentifiersToIds({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: action.metadataName,
        universalForeignKeyValues: action.flatEntity,
      });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'rowLevelPermissionRule',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        objectMetadataId,
        roleId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateRowLevelPermissionRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateRowLevelPermissionRuleAction>,
  ): Promise<void> {
    return;
  }
}
