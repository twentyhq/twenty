import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import {
  FlatDeleteTimelineActivityTypeAction,
  UniversalDeleteTimelineActivityTypeAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-type/types/workspace-migration-timeline-activity-type-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteTimelineActivityTypeActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'timelineActivityType',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteTimelineActivityTypeAction>,
  ): Promise<FlatDeleteTimelineActivityTypeAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteTimelineActivityTypeAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const timelineActivityTypeRepository =
      queryRunner.manager.getRepository<TimelineActivityTypeEntity>(
        TimelineActivityTypeEntity,
      );

    await timelineActivityTypeRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteTimelineActivityTypeAction>,
  ): Promise<void> {
    return;
  }
}
