import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { StepStatus, TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { BASE_TYPESCRIPT_PROJECT_INPUT_SCHEMA } from 'src/engine/core-modules/serverless/drivers/constants/base-typescript-project-input-schema';
import { type CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { type WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-input.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/remove-step';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
  WorkflowEmptyAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

const BASE_STEP_DEFINITION: BaseWorkflowActionSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    continueOnFailure: {
      value: false,
    },
    retryOnFailure: {
      value: false,
    },
  },
};

const DUPLICATED_STEP_POSITION_OFFSET = 50;

@Injectable()
export class WorkflowVersionStepWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async createWorkflowVersionStep({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateWorkflowVersionStepInput;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const {
      workflowVersionId,
      stepType,
      parentStepId,
      nextStepId,
      position,
      parentStepConnectionOptions,
    } = input;

    const newStep = await this.runStepCreationSideEffectsAndBuildStep({
      type: stepType,
      workspaceId,
      position,
      workflowVersionId,
    });

    const enrichedNewStep = await this.enrichOutputSchema({
      step: newStep,
      workspaceId,
    });

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    const existingSteps = workflowVersion.steps || [];

    const existingTrigger = workflowVersion.trigger;

    const { updatedSteps, updatedInsertedStep, updatedTrigger } = insertStep({
      existingSteps,
      existingTrigger,
      insertedStep: enrichedNewStep,
      parentStepId,
      nextStepId,
      parentStepConnectionOptions,
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      trigger: updatedTrigger,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      createdStep: updatedInsertedStep,
      trigger: updatedTrigger,
      steps: updatedSteps,
    });
  }

  async updateWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    step,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    step: WorkflowAction;
  }): Promise<WorkflowAction> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    if (!isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't update step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const enrichedNewStep = await this.enrichOutputSchema({
      step,
      workspaceId,
    });

    const updatedSteps = workflowVersion.steps.map((existingStep) => {
      if (existingStep.id === step.id) {
        return enrichedNewStep;
      } else {
        return existingStep;
      }
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
    });

    return enrichedNewStep;
  }

  async deleteWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    stepIdToDelete,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepIdToDelete: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    const existingTrigger = workflowVersion.trigger;

    const isDeletingTrigger =
      stepIdToDelete === TRIGGER_STEP_ID && isDefined(existingTrigger);

    if (!isDeletingTrigger && !isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't delete step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const stepToDelete = workflowVersion.steps?.find(
      (step) => step.id === stepIdToDelete,
    );

    if (!isDeletingTrigger && !isDefined(stepToDelete)) {
      throw new WorkflowVersionStepException(
        "Can't delete not existing step",
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const stepToDeleteChildrenIds = isDeletingTrigger
      ? (existingTrigger?.nextStepIds ?? [])
      : (stepToDelete?.nextStepIds ?? []);

    const { updatedSteps, updatedTrigger, removedStepIds } = removeStep({
      existingTrigger,
      existingSteps: workflowVersion.steps,
      stepIdToDelete,
      stepToDeleteChildrenIds,
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
      trigger: updatedTrigger,
    });

    const removedSteps =
      workflowVersion.steps?.filter((step) =>
        removedStepIds.includes(step.id),
      ) ?? [];

    await Promise.all(
      removedSteps.map((step) =>
        this.runWorkflowVersionStepDeletionSideEffects({
          step,
          workspaceId,
        }),
      ),
    );

    return computeWorkflowVersionStepChanges({
      steps: updatedSteps,
      trigger: updatedTrigger,
      deletedStepIds: removedStepIds,
    });
  }

  async duplicateWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    stepId,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    const stepToDuplicate = workflowVersion.steps?.find(
      (step) => step.id === stepId,
    );

    if (!isDefined(stepToDuplicate)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const duplicatedStep = await this.createStepForDuplicate({
      step: stepToDuplicate,
      workspaceId,
    });

    const { updatedSteps, updatedInsertedStep, updatedTrigger } = insertStep({
      existingSteps: workflowVersion.steps ?? [],
      existingTrigger: workflowVersion.trigger,
      insertedStep: duplicatedStep,
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
      trigger: updatedTrigger,
    });

    return computeWorkflowVersionStepChanges({
      createdStep: updatedInsertedStep,
      trigger: updatedTrigger,
      steps: updatedSteps,
    });
  }

  async submitFormStep({
    workspaceId,
    stepId,
    workflowRunId,
    response,
  }: {
    workspaceId: string;
    stepId: string;
    workflowRunId: string;
    response: object;
  }) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const step = workflowRun.state?.flow?.steps?.find(
      (step) => step.id === stepId,
    );

    if (!isDefined(step)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    if (step.type !== WorkflowActionType.FORM) {
      throw new WorkflowVersionStepException(
        'Step is not a form',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: t`Step is not a form`,
        },
      );
    }

    const enrichedResponse = await this.enrichFormStepResponse({
      workspaceId,
      step,
      response,
    });

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo: {
        status: StepStatus.SUCCESS,
        result: enrichedResponse,
      },
      workspaceId,
      workflowRunId,
    });

    await this.workflowRunnerWorkspaceService.resume({
      workspaceId,
      workflowRunId,
      lastExecutedStepId: stepId,
    });
  }

  async createDraftStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    switch (step.type) {
      case WorkflowActionType.CODE: {
        await this.serverlessFunctionService.createDraftFromPublishedVersion({
          id: step.settings.input.serverlessFunctionId,
          version: step.settings.input.serverlessFunctionVersion,
          workspaceId,
        });

        return {
          ...step,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              serverlessFunctionVersion: 'draft',
            },
          },
        };
      }
      default: {
        return step;
      }
    }
  }

  private async enrichOutputSchema({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    // We don't enrich on the fly for code and HTTP request workflow actions.
    // For code actions, OutputSchema is computed and updated when testing the serverless function.
    // For HTTP requests and AI agent, OutputSchema is determined by the expamle response input
    if (
      [
        WorkflowActionType.CODE,
        WorkflowActionType.HTTP_REQUEST,
        WorkflowActionType.AI_AGENT,
      ].includes(step.type)
    ) {
      return step;
    }

    const result = { ...step };
    const outputSchema =
      await this.workflowSchemaWorkspaceService.computeStepOutputSchema({
        step,
        workspaceId,
      });

    result.settings = {
      ...result.settings,
      outputSchema: outputSchema || {},
    };

    return result;
  }

  private async runWorkflowVersionStepDeletionSideEffects({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }) {
    switch (step.type) {
      case WorkflowActionType.CODE: {
        if (
          !(await this.serverlessFunctionService.hasServerlessFunctionPublishedVersion(
            step.settings.input.serverlessFunctionId,
          ))
        ) {
          await this.serverlessFunctionService.deleteOneServerlessFunction({
            id: step.settings.input.serverlessFunctionId,
            workspaceId,
            softDelete: false,
          });
        }
        break;
      }
      case WorkflowActionType.AI_AGENT: {
        if (!isDefined(step.settings.input.agentId)) {
          break;
        }

        const agent = await this.agentRepository.findOne({
          where: { id: step.settings.input.agentId, workspaceId },
        });

        if (isDefined(agent)) {
          await this.agentRepository.delete({ id: agent.id, workspaceId });
        }
        break;
      }
    }
  }

  private async runStepCreationSideEffectsAndBuildStep({
    type,
    workspaceId,
    position,
    workflowVersionId,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
    position?: WorkflowStepPositionInput;
    workflowVersionId: string;
  }): Promise<WorkflowAction> {
    const newStepId = v4();

    const baseStep = {
      id: newStepId,
      position,
      valid: false,
      nextStepIds: [],
    };

    switch (type) {
      case WorkflowActionType.CODE: {
        const newServerlessFunction =
          await this.serverlessFunctionService.createOneServerlessFunction(
            {
              name: 'A Serverless Function Code Workflow Step',
              description: '',
            },
            workspaceId,
          );

        if (!isDefined(newServerlessFunction)) {
          throw new WorkflowVersionStepException(
            'Fail to create Code Step',
            WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE,
          );
        }

        return {
          ...baseStep,
          name: 'Code - Serverless Function',
          type: WorkflowActionType.CODE,
          settings: {
            ...BASE_STEP_DEFINITION,
            outputSchema: {
              link: {
                isLeaf: true,
                icon: 'IconVariable',
                tab: 'test',
                label: 'Generate Function Output',
              },
              _outputSchemaType: 'LINK',
            },
            input: {
              serverlessFunctionId: newServerlessFunction.id,
              serverlessFunctionVersion: 'draft',
              serverlessFunctionInput: BASE_TYPESCRIPT_PROJECT_INPUT_SCHEMA,
            },
          },
        };
      }
      case WorkflowActionType.SEND_EMAIL: {
        return {
          ...baseStep,
          name: 'Send Email',
          type: WorkflowActionType.SEND_EMAIL,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              connectedAccountId: '',
              email: '',
              subject: '',
              body: '',
            },
          },
        };
      }
      case WorkflowActionType.CREATE_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          ...baseStep,
          name: 'Create Record',
          type: WorkflowActionType.CREATE_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecord: {},
            },
          },
        };
      }
      case WorkflowActionType.UPDATE_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          ...baseStep,
          name: 'Update Record',
          type: WorkflowActionType.UPDATE_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecord: {},
              objectRecordId: '',
              fieldsToUpdate: [],
            },
          },
        };
      }
      case WorkflowActionType.DELETE_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          ...baseStep,
          name: 'Delete Record',
          type: WorkflowActionType.DELETE_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecordId: '',
            },
          },
        };
      }
      case WorkflowActionType.FIND_RECORDS: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          ...baseStep,
          name: 'Search Records',
          type: WorkflowActionType.FIND_RECORDS,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              limit: 1,
            },
          },
        };
      }
      case WorkflowActionType.FORM: {
        return {
          ...baseStep,
          name: 'Form',
          type: WorkflowActionType.FORM,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: [],
          },
        };
      }
      case WorkflowActionType.FILTER: {
        return {
          ...baseStep,
          name: 'Filter',
          type: WorkflowActionType.FILTER,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              stepFilterGroups: [],
              stepFilters: [],
            },
          },
        };
      }
      case WorkflowActionType.HTTP_REQUEST: {
        return {
          ...baseStep,
          name: 'HTTP Request',
          type: WorkflowActionType.HTTP_REQUEST,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              url: '',
              method: 'GET',
              headers: {},
              body: {},
            },
          },
        };
      }
      case WorkflowActionType.AI_AGENT: {
        return {
          ...baseStep,
          name: 'AI Agent',
          type: WorkflowActionType.AI_AGENT,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              agentId: '',
              prompt: '',
            },
          },
        };
      }
      case WorkflowActionType.ITERATOR: {
        const emptyNodeStep = await this.createEmptyNodeForIteratorStep({
          iteratorStepId: baseStep.id,
          workflowVersionId,
          workspaceId,
        });

        return {
          ...baseStep,
          name: 'Iterator',
          type: WorkflowActionType.ITERATOR,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              items: [],
              initialLoopStepIds: [emptyNodeStep.id],
            },
          },
        };
      }
      default:
        throw new WorkflowVersionStepException(
          `WorkflowActionType '${type}' unknown`,
          WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        );
    }
  }

  private async enrichFormStepResponse({
    workspaceId,
    step,
    response,
  }: {
    workspaceId: string;
    step: WorkflowFormAction;
    response: object;
  }) {
    const responseKeys = Object.keys(response);

    const enrichedResponses = await Promise.all(
      responseKeys.map(async (key) => {
        // @ts-expect-error legacy noImplicitAny
        if (!isDefined(response[key])) {
          // @ts-expect-error legacy noImplicitAny
          return { key, value: response[key] };
        }

        const field = step.settings.input.find((field) => field.name === key);

        if (
          field?.type === 'RECORD' &&
          field?.settings?.objectName &&
          // @ts-expect-error legacy noImplicitAny
          isDefined(response[key].id) &&
          // @ts-expect-error legacy noImplicitAny
          isValidUuid(response[key].id)
        ) {
          const objectMetadataInfo =
            await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
              field.settings.objectName,
              workspaceId,
            );

          const relationFieldsNames = Object.values(
            objectMetadataInfo.objectMetadataItemWithFieldsMaps.fieldsById,
          )
            .filter((field) => field.type === FieldMetadataType.RELATION)
            .map((field) => field.name);

          const repository =
            await this.twentyORMGlobalManager.getRepositoryForWorkspace(
              workspaceId,
              field.settings.objectName,
              { shouldBypassPermissionChecks: true },
            );

          const record = await repository.findOne({
            // @ts-expect-error legacy noImplicitAny
            where: { id: response[key].id },
            relations: relationFieldsNames,
          });

          return { key, value: record };
        } else {
          // @ts-expect-error legacy noImplicitAny
          return { key, value: response[key] };
        }
      }),
    );

    return enrichedResponses.reduce((acc, { key, value }) => {
      // @ts-expect-error legacy noImplicitAny
      acc[key] = value;

      return acc;
    }, {});
  }

  private async createStepForDuplicate({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    const duplicatedStepPosition = {
      x: (step.position?.x ?? 0) + DUPLICATED_STEP_POSITION_OFFSET,
      y: (step.position?.y ?? 0) + DUPLICATED_STEP_POSITION_OFFSET,
    };

    switch (step.type) {
      case WorkflowActionType.CODE: {
        const newServerlessFunction =
          await this.serverlessFunctionService.duplicateServerlessFunction({
            id: step.settings.input.serverlessFunctionId,
            version: step.settings.input.serverlessFunctionVersion,
            workspaceId,
          });

        return {
          ...step,
          id: v4(),
          name: `${step.name} (Duplicate)`,
          nextStepIds: [],
          position: duplicatedStepPosition,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              serverlessFunctionId: newServerlessFunction.id,
              serverlessFunctionVersion: 'draft',
            },
          },
        };
      }
      default: {
        return {
          ...step,
          id: v4(),
          name: `${step.name} (Duplicate)`,
          nextStepIds: [],
          position: duplicatedStepPosition,
        };
      }
    }
  }

  private async createEmptyNodeForIteratorStep({
    iteratorStepId,
    workflowVersionId,
    workspaceId,
  }: {
    iteratorStepId: string;
    workflowVersionId: string;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const existingSteps = workflowVersion.steps ?? [];

    const emptyNodeStep: WorkflowEmptyAction = {
      id: v4(),
      name: 'Empty Node',
      type: WorkflowActionType.EMPTY,
      valid: true,
      nextStepIds: [iteratorStepId],
      settings: {
        ...BASE_STEP_DEFINITION,
        input: {},
      },
    };

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: [...existingSteps, emptyNodeStep],
    });

    return emptyNodeStep;
  }
}
