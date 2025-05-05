import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { BASE_TYPESCRIPT_PROJECT_INPUT_SCHEMA } from 'src/engine/core-modules/serverless/drivers/constants/base-typescript-project-input-schema';
import { CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { StepOutput } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-step/utils/insert-step';
import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-step/utils/remove-step';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  WorkflowAction,
  WorkflowActionType,
  WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

const TRIGGER_STEP_ID = 'trigger';

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

@Injectable()
export class WorkflowVersionStepWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  async createWorkflowVersionStep({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateWorkflowVersionStepInput;
  }): Promise<WorkflowActionDTO> {
    const { workflowVersionId, stepType, parentStepId, nextStepId } = input;

    const newStep = await this.getStepDefaultDefinition({
      type: stepType,
      workspaceId,
    });
    const enrichedNewStep = await this.enrichOutputSchema({
      step: newStep,
      workspaceId,
    });
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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

    const existingSteps = workflowVersion.steps || [];
    const updatedSteps = insertStep({
      existingSteps,
      insertedStep: enrichedNewStep,
      parentStepId,
      nextStepId,
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
    });

    return enrichedNewStep;
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
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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

    if (!isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't update step from undefined steps",
        WorkflowVersionStepExceptionCode.UNDEFINED,
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
  }): Promise<WorkflowActionDTO> {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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

    if (!isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't delete step from undefined steps",
        WorkflowVersionStepExceptionCode.UNDEFINED,
      );
    }

    const stepToDelete = workflowVersion.steps.find(
      (step) => step.id === stepIdToDelete,
    );

    if (!isDefined(stepToDelete)) {
      throw new WorkflowVersionStepException(
        "Can't delete not existing step",
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const workflowVersionUpdates =
      stepIdToDelete === TRIGGER_STEP_ID
        ? { trigger: null }
        : {
            steps: removeStep({
              existingSteps: workflowVersion.steps,
              stepIdToDelete,
              stepToDeleteChildrenIds: stepToDelete.nextStepIds,
            }),
          };

    await workflowVersionRepository.update(
      workflowVersion.id,
      workflowVersionUpdates,
    );

    await this.runWorkflowVersionStepDeletionSideEffects({
      step: stepToDelete,
      workspaceId,
    });

    return stepToDelete;
  }

  async duplicateStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    switch (step.type) {
      case WorkflowActionType.CODE: {
        await this.serverlessFunctionService.usePublishedVersionAsDraft({
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
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail(
        workflowRunId,
      );

    const step = workflowRun.output?.flow?.steps?.find(
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
        WorkflowVersionStepExceptionCode.INVALID,
      );
    }

    const enrichedResponse = await this.enrichFormStepResponse({
      step,
      response,
    });

    const newStepOutput: StepOutput = {
      id: stepId,
      output: {
        result: enrichedResponse,
      },
    };

    const updatedContext = {
      ...workflowRun.context,
      [stepId]: enrichedResponse,
    };

    await this.workflowRunWorkspaceService.saveWorkflowRunState({
      workflowRunId,
      stepOutput: newStepOutput,
      context: updatedContext,
    });

    await this.workflowRunnerWorkspaceService.resume({
      workspaceId,
      workflowRunId,
      lastExecutedStepId: stepId,
    });
  }

  private async enrichOutputSchema({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    // We don't enrich on the fly for code workflow action. OutputSchema is computed and updated when testing the serverless function
    if (step.type === WorkflowActionType.CODE) {
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
          });
        }
        break;
      }
    }
  }

  private async getStepDefaultDefinition({
    type,
    workspaceId,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    const newStepId = v4();

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
            WorkflowVersionStepExceptionCode.FAILURE,
          );
        }

        return {
          id: newStepId,
          name: 'Code - Serverless Function',
          type: WorkflowActionType.CODE,
          valid: false,
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
          id: newStepId,
          name: 'Send Email',
          type: WorkflowActionType.SEND_EMAIL,
          valid: false,
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
          id: newStepId,
          name: 'Create Record',
          type: WorkflowActionType.CREATE_RECORD,
          valid: false,
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
          id: newStepId,
          name: 'Update Record',
          type: WorkflowActionType.UPDATE_RECORD,
          valid: false,
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
          id: newStepId,
          name: 'Delete Record',
          type: WorkflowActionType.DELETE_RECORD,
          valid: false,
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
          id: newStepId,
          name: 'Search Records',
          type: WorkflowActionType.FIND_RECORDS,
          valid: false,
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
          id: newStepId,
          name: 'Form',
          type: WorkflowActionType.FORM,
          valid: false,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: [
              {
                id: v4(),
                name: 'company',
                label: 'Company',
                placeholder: 'Select a company',
                type: FieldMetadataType.TEXT,
              },
              {
                id: v4(),
                name: 'number',
                label: 'Number',
                placeholder: '1000',
                type: FieldMetadataType.NUMBER,
              },
            ],
          },
        };
      }
      default:
        throw new WorkflowVersionStepException(
          `WorkflowActionType '${type}' unknown`,
          WorkflowVersionStepExceptionCode.UNKNOWN,
        );
    }
  }

  private async enrichFormStepResponse({
    step,
    response,
  }: {
    step: WorkflowFormAction;
    response: object;
  }) {
    const responseKeys = Object.keys(response);

    const enrichedResponses = await Promise.all(
      responseKeys.map(async (key) => {
        if (!isDefined(response[key])) {
          return { key, value: response[key] };
        }

        const field = step.settings.input.find((field) => field.name === key);

        if (
          field?.type === 'RECORD' &&
          field?.settings?.objectName &&
          isDefined(response[key].id) &&
          isValidUuid(response[key].id)
        ) {
          const repository = await this.twentyORMManager.getRepository(
            field.settings.objectName,
          );

          const record = await repository.findOne({
            where: { id: response[key].id },
          });

          return { key, value: record };
        } else {
          return { key, value: response[key] };
        }
      }),
    );

    return enrichedResponses.reduce((acc, { key, value }) => {
      acc[key] = value;

      return acc;
    }, {});
  }
}
