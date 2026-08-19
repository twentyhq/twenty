import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { TimelineActivityRuleEntity } from 'src/engine/metadata-modules/timeline-activity-rule/entities/timeline-activity-rule.entity';
import {
  FlatDeleteTimelineActivityRuleAction,
  UniversalDeleteTimelineActivityRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-rule/types/workspace-migration-timeline-activity-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteTimelineActivityRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'timelineActivityRule',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteTimelineActivityRuleAction>,
  ): Promise<FlatDeleteTimelineActivityRuleAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteTimelineActivityRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const timelineActivityRuleRepository =
      queryRunner.manager.getRepository<TimelineActivityRuleEntity>(
        TimelineActivityRuleEntity,
      );

    await timelineActivityRuleRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteTimelineActivityRuleAction>,
  ): Promise<void> {
    return;
  }
}
