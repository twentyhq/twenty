/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { RowLevelPermissionRuleEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-rule.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateRowLevelPermissionRuleAction,
  UniversalUpdateRowLevelPermissionRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-rule/types/workspace-migration-row-level-permission-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateRowLevelPermissionRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'rowLevelPermissionRule',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateRowLevelPermissionRuleAction>,
  ): Promise<FlatUpdateRowLevelPermissionRuleAction> {
    const { action, allFlatEntityMaps } = context;

    const flatRowLevelPermissionRule =
      findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: allFlatEntityMaps.flatRowLevelPermissionRuleMaps,
        universalIdentifier: action.universalIdentifier,
      });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'rowLevelPermissionRule',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'rowLevelPermissionRule',
      entityId: flatRowLevelPermissionRule.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRowLevelPermissionRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionRuleEntity>(
        RowLevelPermissionRuleEntity,
      );

    await repository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRowLevelPermissionRuleAction>,
  ): Promise<void> {
    return;
  }
}
