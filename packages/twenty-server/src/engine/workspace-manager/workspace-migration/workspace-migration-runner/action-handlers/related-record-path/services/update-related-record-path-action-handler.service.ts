/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { RelatedRecordPathEntity } from 'src/engine/metadata-modules/related-record-path/entities/related-record-path.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateRelatedRecordPathAction,
  UniversalUpdateRelatedRecordPathAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/related-record-path/types/workspace-migration-related-record-path-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateRelatedRecordPathActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'relatedRecordPath',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateRelatedRecordPathAction>,
  ): Promise<FlatUpdateRelatedRecordPathAction> {
    const { action, allFlatEntityMaps } = context;

    const flatRelatedRecordPath = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatRelatedRecordPathMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'relatedRecordPath',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'relatedRecordPath',
      entityId: flatRelatedRecordPath.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRelatedRecordPathAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const repository =
      queryRunner.manager.getRepository<RelatedRecordPathEntity>(
        RelatedRecordPathEntity,
      );

    await repository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRelatedRecordPathAction>,
  ): Promise<void> {
    return;
  }
}
