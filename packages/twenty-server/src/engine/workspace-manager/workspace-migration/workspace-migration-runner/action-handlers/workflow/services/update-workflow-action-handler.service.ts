import { Injectable } from '@nestjs/common';

import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Equal, IsNull, Or } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateWorkflowAction,
  UniversalUpdateWorkflowAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/workflow/types/workspace-migration-workflow-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateWorkflowActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'workflow',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateWorkflowAction>,
  ): Promise<FlatUpdateWorkflowAction> {
    const { action, allFlatEntityMaps } = context;

    const flatWorkflow = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatWorkflowMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'workflow',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'workflow',
      entityId: flatWorkflow.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateWorkflowAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { entityId, update } = flatAction;

    const workflowRepository =
      queryRunner.manager.getRepository<WorkflowEntity>(WorkflowEntity);

    const hasVisibilityOrCreatorChange =
      !isUndefined(update.visibility) ||
      !isUndefined(update.createdByUserWorkspaceId);

    if (!hasVisibilityOrCreatorChange) {
      await workflowRepository.update({ id: entityId, workspaceId }, update);

      return;
    }

    const { createdByUserWorkspaceId: currentCreatedByUserWorkspaceId } =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: entityId,
        flatEntityMaps: allFlatEntityMaps.flatWorkflowMaps,
      });

    const resultingCreatedByUserWorkspaceId = isUndefined(
      update.createdByUserWorkspaceId,
    )
      ? currentCreatedByUserWorkspaceId
      : update.createdByUserWorkspaceId;

    const { affected } = await workflowRepository.update(
      {
        id: entityId,
        workspaceId,
        createdByUserWorkspaceId: isDefined(resultingCreatedByUserWorkspaceId)
          ? Or(IsNull(), Equal(resultingCreatedByUserWorkspaceId))
          : IsNull(),
      },
      update,
    );

    if (affected === 0) {
      throw new CoreWorkflowMetadataException(
        `Workflow '${entityId}' is missing or was created by another member`,
        CoreWorkflowMetadataExceptionCode.WORKFLOW_OWNERSHIP_CONDITION_NOT_MET,
      );
    }
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateWorkflowAction>,
  ): Promise<void> {
    return;
  }
}
