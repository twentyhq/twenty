/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { RecordInheritanceRuleEntity } from 'src/engine/metadata-modules/record-inheritance-rule/entities/record-inheritance-rule.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateRecordInheritanceRuleAction,
  UniversalUpdateRecordInheritanceRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/record-inheritance-rule/types/workspace-migration-record-inheritance-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateRecordInheritanceRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'recordInheritanceRule',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateRecordInheritanceRuleAction>,
  ): Promise<FlatUpdateRecordInheritanceRuleAction> {
    const { action, allFlatEntityMaps } = context;

    const flatRecordInheritanceRule =
      findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: allFlatEntityMaps.flatRecordInheritanceRuleMaps,
        universalIdentifier: action.universalIdentifier,
      });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'recordInheritanceRule',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'recordInheritanceRule',
      entityId: flatRecordInheritanceRule.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRecordInheritanceRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const repository =
      queryRunner.manager.getRepository<RecordInheritanceRuleEntity>(
        RecordInheritanceRuleEntity,
      );

    await repository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRecordInheritanceRuleAction>,
  ): Promise<void> {
    return;
  }
}
