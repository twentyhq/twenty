import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateTimelineActivityRuleAction,
  UniversalCreateTimelineActivityRuleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-rule/types/workspace-migration-timeline-activity-rule-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateTimelineActivityRuleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'timelineActivityRule',
) {
  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
    preallocatedIdByUniversalIdentifierByMetadataName,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateTimelineActivityRuleAction>): Promise<FlatCreateTimelineActivityRuleAction> {
    const { objectMetadataId, relationFieldMetadataId } =
      resolveUniversalRelationIdentifiersToIds({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: action.metadataName,
        universalForeignKeyValues: action.flatEntity,
        preallocatedIdByUniversalIdentifierByMetadataName,
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        objectMetadataId,
        relationFieldMetadataId,
        id: action.id ?? v4(),
        applicationId: flatApplication.id,
        workspaceId,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateTimelineActivityRuleAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateTimelineActivityRuleAction>,
  ): Promise<void> {
    return;
  }
}
