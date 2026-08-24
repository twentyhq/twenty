import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateTimelineActivityTypeAction,
  UniversalUpdateTimelineActivityTypeAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/timeline-activity-type/types/workspace-migration-timeline-activity-type-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateTimelineActivityTypeActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'timelineActivityType',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateTimelineActivityTypeAction>,
  ): Promise<FlatUpdateTimelineActivityTypeAction> {
    const { action, allFlatEntityMaps } = context;

    const flatTimelineActivityType = findFlatEntityByUniversalIdentifierOrThrow(
      {
        flatEntityMaps: allFlatEntityMaps.flatTimelineActivityTypeMaps,
        universalIdentifier: action.universalIdentifier,
      },
    );

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'timelineActivityType',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'timelineActivityType',
      entityId: flatTimelineActivityType.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateTimelineActivityTypeAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const timelineActivityTypeRepository =
      queryRunner.manager.getRepository<TimelineActivityTypeEntity>(
        TimelineActivityTypeEntity,
      );

    await timelineActivityTypeRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateTimelineActivityTypeAction>,
  ): Promise<void> {
    return;
  }
}
