import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { SharingRuleEntity } from 'src/engine/metadata-modules/sharing-rule/entities/sharing-rule.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateSharingRuleAction,
  UniversalUpdateSharingRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/sharing-rule/types/workspace-migration-sharing-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateSharingRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'sharingRule',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateSharingRuleAction>,
  ): Promise<FlatUpdateSharingRuleAction> {
    const { action, allFlatEntityMaps } = context;

    const flatSharingRule = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatSharingRuleMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'sharingRule',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'sharingRule',
      entityId: flatSharingRule.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateSharingRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const sharingRuleRepository =
      queryRunner.manager.getRepository<SharingRuleEntity>(SharingRuleEntity);

    await sharingRuleRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateSharingRuleAction>,
  ): Promise<void> {
    return;
  }
}
