import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { EventMetadataEntity } from 'src/engine/metadata-modules/event-metadata/entities/event-metadata.entity';
import {
  FlatDeleteEventMetadataAction,
  UniversalDeleteEventMetadataAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/event-metadata/types/workspace-migration-event-metadata-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteEventMetadataActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'eventMetadata',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteEventMetadataAction>,
  ): Promise<FlatDeleteEventMetadataAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteEventMetadataAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const eventMetadataRepository =
      queryRunner.manager.getRepository<EventMetadataEntity>(
        EventMetadataEntity,
      );

    await eventMetadataRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteEventMetadataAction>,
  ): Promise<void> {
    return;
  }
}
