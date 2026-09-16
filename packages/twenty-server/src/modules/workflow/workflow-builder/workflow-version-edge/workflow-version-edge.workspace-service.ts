import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import {
  assertEdgeConnectionOptionsAreSupported,
  buildSourceStepWithAddedEdge,
  buildSourceStepWithRemovedEdge,
} from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/build-updated-source-step-for-edge.util';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepConnectionOptions';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionEdgeWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {}

  async createWorkflowVersionEdge({
    source,
    target,
    workflowVersionId,
    workspaceId,
    sourceConnectionOptions,
  }: {
    source: string;
    target: string;
    workflowVersionId: string;
    workspaceId: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    assertEdgeConnectionOptionsAreSupported(sourceConnectionOptions);

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
          workflowVersionId,
          workspaceId,
        });

      assertWorkflowVersionIsDraft(workflowVersion);

      const trigger = workflowVersion.trigger;
      const steps = workflowVersion.steps || [];

      const targetStep = steps.find((step) => step.id === target);

      if (!isDefined(targetStep)) {
        throw new WorkflowVersionEdgeException(
          `Target step '${target}' not found in workflowVersion '${workflowVersionId}'`,
          WorkflowVersionEdgeExceptionCode.NOT_FOUND,
        );
      }

      const isSourceTrigger = source === TRIGGER_STEP_ID;

      if (isSourceTrigger) {
        return this.createTriggerEdge({
          trigger,
          steps,
          target,
          workflowVersion,
          workspaceId,
        });
      } else {
        return this.createStepEdge({
          trigger,
          steps,
          source,
          target,
          sourceConnectionOptions,
          workflowVersion,
          workspaceId,
        });
      }
    }, authContext);
  }

  async deleteWorkflowVersionEdge({
    source,
    target,
    workflowVersionId,
    workspaceId,
    sourceConnectionOptions,
  }: {
    source: string;
    target: string;
    workflowVersionId: string;
    workspaceId: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    assertEdgeConnectionOptionsAreSupported(sourceConnectionOptions);

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
          workflowVersionId,
          workspaceId,
        });

      assertWorkflowVersionIsDraft(workflowVersion);

      const trigger = workflowVersion.trigger;
      const steps = workflowVersion.steps || [];

      const targetStep = steps.find((step) => step.id === target);

      if (!isDefined(targetStep)) {
        throw new WorkflowVersionEdgeException(
          `Target step '${target}' not found in workflowVersion '${workflowVersionId}'`,
          WorkflowVersionEdgeExceptionCode.NOT_FOUND,
        );
      }

      const isSourceTrigger = source === TRIGGER_STEP_ID;

      if (isSourceTrigger) {
        return this.deleteTriggerEdge({
          trigger,
          steps,
          target,
          workflowVersion,
          workspaceId,
        });
      } else {
        return this.deleteStepEdge({
          trigger,
          steps,
          source,
          target,
          workflowVersion,
          workspaceId,
          sourceConnectionOptions,
        });
      }
    }, authContext);
  }

  private async createTriggerEdge({
    trigger,
    steps,
    target,
    workflowVersion,
    workspaceId,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workspaceId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    if (!isDefined(trigger)) {
      throw new WorkflowVersionEdgeException(
        `Trigger not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (trigger.nextStepIds?.includes(target)) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const updatedTrigger = {
      ...trigger,
      nextStepIds: [...(trigger.nextStepIds ?? []), target],
    };

    await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
      workspaceId,
      async (workflowVersionRepository) => {
        await workflowVersionRepository.update(workflowVersion.id, {
          trigger: updatedTrigger,
        });

        return workflowVersion.id;
      },
    );

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
    });
  }

  private async createStepEdge({
    trigger,
    steps,
    source,
    target,
    workflowVersion,
    workspaceId,
    sourceConnectionOptions,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    source: string;
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workspaceId: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const sourceStep = steps.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (
      sourceStep.nextStepIds?.includes(target) &&
      !isDefined(sourceConnectionOptions)
    ) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const { updatedSourceStep, shouldPersist } = buildSourceStepWithAddedEdge({
      sourceStep,
      target,
      sourceConnectionOptions,
    });

    const updatedSteps = steps.map((step) => {
      if (step.id === source) {
        return updatedSourceStep;
      }

      return step;
    });

    if (shouldPersist) {
      await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
        workspaceId,
        async (workflowVersionRepository) => {
          await workflowVersionRepository.update(workflowVersion.id, {
            steps: updatedSteps,
          });

          return workflowVersion.id;
        },
      );
    }

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedSteps,
    });
  }

  private async deleteTriggerEdge({
    trigger,
    steps,
    target,
    workflowVersion,
    workspaceId,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workspaceId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    if (!isDefined(trigger)) {
      throw new WorkflowVersionEdgeException(
        `Trigger not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (!trigger.nextStepIds?.includes(target)) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const updatedTrigger = {
      ...trigger,
      nextStepIds: trigger.nextStepIds?.filter(
        (nextStepId: string) => nextStepId !== target,
      ),
    };

    await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
      workspaceId,
      async (workflowVersionRepository) => {
        await workflowVersionRepository.update(workflowVersion.id, {
          trigger: updatedTrigger,
        });

        return workflowVersion.id;
      },
    );

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
    });
  }

  private async deleteStepEdge({
    trigger,
    steps,
    source,
    target,
    workflowVersion,
    workspaceId,
    sourceConnectionOptions,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    source: string;
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workspaceId: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const sourceStep = steps.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (
      !sourceStep.nextStepIds?.includes(target) &&
      !isDefined(sourceConnectionOptions)
    ) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const { updatedSourceStep, shouldPersist } = buildSourceStepWithRemovedEdge(
      {
        sourceStep,
        target,
        sourceConnectionOptions,
      },
    );

    if (!shouldPersist) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const updatedSteps = steps.map((step) => {
      if (step.id === source) {
        return updatedSourceStep;
      }

      return step;
    });

    await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
      workspaceId,
      async (workflowVersionRepository) => {
        await workflowVersionRepository.update(workflowVersion.id, {
          steps: updatedSteps,
        });

        return workflowVersion.id;
      },
    );

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedSteps,
    });
  }
}
