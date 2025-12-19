import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update-input.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowVersionHasSteps } from 'src/modules/workflow/common/utils/assert-workflow-version-has-steps';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowVersionWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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

          const position = await this.recordPositionService.buildRecordPosition(
            {
              value: 'first',
              objectMetadata: {
                isCustom: false,
                nameSingular: 'workflowVersion',
              },
              workspaceId,
            },
          );

          const insertResult = await workflowVersionRepository.insert({
            workflowId,
            name: `v${workflowVersionsCount + 1}`,
            status: WorkflowVersionStatus.DRAFT,
            position,
          });

          draftWorkflowVersion = insertResult
            .generatedMaps[0] as WorkflowVersionWorkspaceEntity;
        }

        assertWorkflowVersionIsDraft(draftWorkflowVersion);

        const newWorkflowVersionTrigger = workflowVersionToCopy.trigger;
        const newWorkflowVersionSteps: WorkflowAction[] = [];

        for (const step of workflowVersionToCopy.steps) {
          const duplicatedStep =
            await this.workflowVersionStepWorkspaceService.createDraftStep({
              step,
              workspaceId,
            });

          newWorkflowVersionSteps.push(duplicatedStep);
        }

        await workflowVersionRepository.update(draftWorkflowVersion.id, {
          steps: newWorkflowVersionSteps,
          trigger: newWorkflowVersionTrigger,
        });

        return {
          ...draftWorkflowVersion,
          name: draftWorkflowVersion.name ?? '',
          steps: newWorkflowVersionSteps,
          trigger: newWorkflowVersionTrigger,
        };
      },
    );
  }

  async duplicateWorkflow({
    workspaceId,
    workflowIdToDuplicate,
    workflowVersionIdToCopy,
  }: {
    workspaceId: string;
    workflowIdToDuplicate: string;
    workflowVersionIdToCopy: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const sourceWorkflow = await workflowRepository.findOne({
          where: {
            id: workflowIdToDuplicate,
          },
        });

        if (!isDefined(sourceWorkflow)) {
          throw new WorkflowVersionStepException(
            'Source workflow not found',
            WorkflowVersionStepExceptionCode.NOT_FOUND,
          );
        }

        const sourceVersion = await workflowVersionRepository.findOne({
          where: {
            id: workflowVersionIdToCopy,
            workflowId: workflowIdToDuplicate,
          },
        });

        if (!isDefined(sourceVersion)) {
          throw new WorkflowVersionStepException(
            'WorkflowVersion to copy not found',
            WorkflowVersionStepExceptionCode.NOT_FOUND,
          );
        }

        assertWorkflowVersionTriggerIsDefined(sourceVersion);
        assertWorkflowVersionHasSteps(sourceVersion);

        const workflowPosition =
          await this.recordPositionService.buildRecordPosition({
            value: 'first',
            objectMetadata: {
              isCustom: false,
              nameSingular: 'workflow',
            },
            workspaceId,
          });

        const insertWorkflowResult = await workflowRepository.insert({
          name: `${sourceWorkflow.name} (Duplicate)`,
          statuses: [WorkflowStatus.DRAFT],
          position: workflowPosition,
        });

        const newWorkflowId = (
          insertWorkflowResult.generatedMaps[0] as WorkflowWorkspaceEntity
        ).id;

        const versionPosition =
          await this.recordPositionService.buildRecordPosition({
            value: 'first',
            objectMetadata: {
              isCustom: false,
              nameSingular: 'workflowVersion',
            },
            workspaceId,
          });

        const insertVersionResult = await workflowVersionRepository.insert({
          workflowId: newWorkflowId,
          name: 'v1',
          status: WorkflowVersionStatus.DRAFT,
          position: versionPosition,
        });

        const newDraftVersion = insertVersionResult
          .generatedMaps[0] as WorkflowVersionWorkspaceEntity;

        const newTrigger = sourceVersion.trigger;
        const sourceToClonedPairs: Array<{
          source: WorkflowAction;
          duplicated: WorkflowAction;
        }> = [];
        const oldToNewIdMap = new Map<string, string>();

        for (const step of sourceVersion.steps ?? []) {
          const clonedStep =
            await this.workflowVersionStepOperationsWorkspaceService.cloneStep({
              step,
              workspaceId,
            });

          sourceToClonedPairs.push({
            source: step,
            duplicated: clonedStep,
          });
          oldToNewIdMap.set(step.id, clonedStep.id);
        }

        const remappedTrigger = isDefined(newTrigger)
          ? {
              ...newTrigger,
              nextStepIds: (newTrigger.nextStepIds ?? []).map(
                (oldId) => oldToNewIdMap.get(oldId) ?? oldId,
              ),
            }
          : undefined;

        const remappedSteps: WorkflowAction[] = sourceToClonedPairs.map(
          ({ source, duplicated }) => {
            const remappedStep = {
              ...duplicated,
              nextStepIds: (source.nextStepIds ?? []).map(
                (oldId) => oldToNewIdMap.get(oldId) ?? oldId,
              ),
            };

            if (
              source.type === WorkflowActionType.ITERATOR &&
              isDefined(source.settings?.input?.initialLoopStepIds)
            ) {
              remappedStep.settings = {
                ...remappedStep.settings,
                input: {
                  ...remappedStep.settings.input,
                  initialLoopStepIds:
                    source.settings.input.initialLoopStepIds.map(
                      (oldId) => oldToNewIdMap.get(oldId) ?? oldId,
                    ),
                },
              };
            }

            return remappedStep;
          },
        );

        await workflowVersionRepository.update(newDraftVersion.id, {
          steps: remappedSteps,
          trigger: remappedTrigger,
        });

        return {
          ...newDraftVersion,
          name: newDraftVersion.name ?? '',
          steps: remappedSteps,
          trigger: remappedTrigger ?? null,
        };
      },
    );
  }

  async updateWorkflowVersionPositions({
    workflowVersionId,
    positions,
    workspaceId,
  }: {
    workflowVersionId: string;
    positions: WorkflowStepPositionUpdateInput[];
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const workflowVersion = await workflowVersionRepository.findOneOrFail({
          where: {
            id: workflowVersionId,
          },
        });

        assertWorkflowVersionIsDraft(workflowVersion);

        const triggerPosition = positions.find(
          (position) => position.id === TRIGGER_STEP_ID,
        );

        const updatedTrigger =
          isDefined(triggerPosition) && isDefined(workflowVersion.trigger)
            ? {
                ...workflowVersion.trigger,
                position: triggerPosition.position,
              }
            : undefined;

        const updatedSteps = workflowVersion.steps?.map((step) => {
          const updatedStep = positions.find(
            (position) => position.id === step.id,
          );

          if (updatedStep) {
            return {
              ...step,
              position: updatedStep.position,
            };
          }

          return step;
        });

        const updatePayload = {
          ...(!isDefined(updatedTrigger) ? {} : { trigger: updatedTrigger }),
          ...(!isDefined(updatedSteps) ? {} : { steps: updatedSteps }),
        };

        await workflowVersionRepository.update(
          workflowVersionId,
          updatePayload,
        );
      },
    );
  }
}
