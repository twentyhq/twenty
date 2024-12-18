import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowBuilderWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-builder.workspace-service';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { isDefined } from 'src/utils/is-defined';
import { BASE_TYPESCRIPT_PROJECT_INPUT_SCHEMA } from 'src/engine/core-modules/serverless/drivers/constants/base-typescript-project-input-schema';

const TRIGGER_STEP_ID = 'trigger';

const BASE_STEP_DEFINITION: BaseWorkflowActionSettings = {
  input: {},
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
    private readonly workflowBuilderWorkspaceService: WorkflowBuilderWorkspaceService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  private async getStepDefaultDefinition({
    type,
    workspaceId,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    const newStepId = v4();

    switch (`${type}`) {
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
      default:
        throw new WorkflowVersionStepException(
          `WorkflowActionType '${type}' unknown`,
          WorkflowVersionStepExceptionCode.UNKNOWN,
        );
    }
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
      await this.workflowBuilderWorkspaceService.computeStepOutputSchema({
        step,
        workspaceId,
      });

    result.settings = {
      ...result.settings,
      outputSchema: outputSchema || {},
    };

    return result;
  }

  async createWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    stepType,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepType: WorkflowActionType;
  }): Promise<WorkflowActionDTO> {
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

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: [...(workflowVersion.steps || []), enrichedNewStep],
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
    stepId,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepId: string;
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

    const stepToDelete = workflowVersion.steps.filter(
      (step) => step.id === stepId,
    )?.[0];

    if (!isDefined(stepToDelete)) {
      throw new WorkflowVersionStepException(
        "Can't delete not existing step",
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const workflowVersionUpdates =
      stepId === TRIGGER_STEP_ID
        ? { trigger: null }
        : { steps: workflowVersion.steps.filter((step) => step.id !== stepId) };

    await workflowVersionRepository.update(
      workflowVersion.id,
      workflowVersionUpdates,
    );

    switch (stepToDelete.type) {
      case WorkflowActionType.CODE:
        await this.serverlessFunctionService.deleteOneServerlessFunction(
          stepToDelete.settings.input.serverlessFunctionId,
          workspaceId,
        );
    }

    return stepToDelete;
  }
}
