import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { TimelineActivityRuleEntity } from 'src/engine/metadata-modules/timeline-activity-rule/entities/timeline-activity-rule.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateTimelineActivityRuleAction,
  UniversalUpdateTimelineActivityRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-rule/types/workspace-migration-timeline-activity-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateTimelineActivityRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'timelineActivityRule',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateTimelineActivityRuleAction>,
  ): Promise<FlatUpdateTimelineActivityRuleAction> {
    const { action, allFlatEntityMaps } = context;

    const flatTimelineActivityRule = findFlatEntityByUniversalIdentifierOrThrow(
      {
        flatEntityMaps: allFlatEntityMaps.flatTimelineActivityRuleMaps,
        universalIdentifier: action.universalIdentifier,
      },
    );

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'timelineActivityRule',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'timelineActivityRule',
      entityId: flatTimelineActivityRule.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateTimelineActivityRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const timelineActivityRuleRepository =
      queryRunner.manager.getRepository<TimelineActivityRuleEntity>(
        TimelineActivityRuleEntity,
      );

    await timelineActivityRuleRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateTimelineActivityRuleAction>,
  ): Promise<void> {
    return;
  }
}
