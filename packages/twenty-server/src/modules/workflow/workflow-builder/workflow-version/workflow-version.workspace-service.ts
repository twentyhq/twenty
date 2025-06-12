import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionHasSteps } from 'src/modules/workflow/common/utils/assert-workflow-version-has-steps';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowVersionWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async createDraftFromWorkflowVersion({
    workspaceId,
    workflowId,
    workflowVersionIdToCopy,
  }: {
    workspaceId: string;
    workflowId: string;
    workflowVersionIdToCopy: string;
  }) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionToCopy = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionIdToCopy,
        workflowId,
      },
    });

    if (!isDefined(workflowVersionToCopy)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion to copy not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionTriggerIsDefined(workflowVersionToCopy);
    assertWorkflowVersionHasSteps(workflowVersionToCopy);

    let draftWorkflowVersion = await workflowVersionRepository.findOne({
      where: {
        workflowId,
        status: WorkflowVersionStatus.DRAFT,
      },
    });

    if (!isDefined(draftWorkflowVersion)) {
      const workflowVersionsCount = await workflowVersionRepository.count({
        where: {
          workflowId,
        },
      });

      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

      draftWorkflowVersion = await workflowVersionRepository.save({
        workflowId,
        name: `v${workflowVersionsCount + 1}`,
        status: WorkflowVersionStatus.DRAFT,
        position,
      });

      await this.emitWorkflowVersionCreationEvent({
        workflowVersion: draftWorkflowVersion,
        workspaceId,
      });
    }

    assertWorkflowVersionIsDraft(draftWorkflowVersion);

    const newWorkflowVersionTrigger = workflowVersionToCopy.trigger;
    const newWorkflowVersionSteps: WorkflowAction[] = [];

    for (const step of workflowVersionToCopy.steps) {
      const duplicatedStep =
        await this.workflowVersionStepWorkspaceService.duplicateStep({
          step,
          workspaceId,
        });

      newWorkflowVersionSteps.push(duplicatedStep);
    }

    await workflowVersionRepository.update(draftWorkflowVersion.id, {
      steps: newWorkflowVersionSteps,
      trigger: newWorkflowVersionTrigger,
    });

    return draftWorkflowVersion.id;
  }

  private async emitWorkflowVersionCreationEvent({
    workflowVersion,
    workspaceId,
  }: {
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workspaceId: string;
  }) {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: 'workflowVersion',
        workspaceId,
      },
    });

    if (!objectMetadata) {
      throw new WorkflowVersionStepException(
        'Object metadata not found',
        WorkflowVersionStepExceptionCode.FAILURE,
      );
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workflowVersion',
      action: DatabaseEventAction.CREATED,
      events: [
        {
          recordId: workflowVersion.id,
          objectMetadata,
          properties: {
            after: workflowVersion,
          },
        },
      ],
      workspaceId,
    });
  }
}
