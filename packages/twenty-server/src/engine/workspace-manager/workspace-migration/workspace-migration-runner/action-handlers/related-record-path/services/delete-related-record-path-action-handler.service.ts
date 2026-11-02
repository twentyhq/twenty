/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RelatedRecordPathEntity } from 'src/engine/metadata-modules/related-record-path/entities/related-record-path.entity';
import {
  FlatDeleteRelatedRecordPathAction,
  UniversalDeleteRelatedRecordPathAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/related-record-path/types/workspace-migration-related-record-path-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRelatedRecordPathActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'relatedRecordPath',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteRelatedRecordPathAction>,
  ): Promise<FlatDeleteRelatedRecordPathAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteRelatedRecordPathAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const repository =
      queryRunner.manager.getRepository<RelatedRecordPathEntity>(
        RelatedRecordPathEntity,
      );

    await repository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteRelatedRecordPathAction>,
  ): Promise<void> {
    return;
  }
}
