import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { isDefined } from 'src/utils/is-defined';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowBuilderWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-builder.workspace-service';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { WorkflowRecordCRUDType } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
const TRIGGER_STEP_ID = 'trigger';

@Injectable()
export class WorkflowVersionWorkspaceService {
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
          throw new Error('Fail to create Code Step');
        }

        return {
          id: newStepId,
          name: 'Code',
          type,
          valid: false,
          settings: {
            input: {
              serverlessFunctionId: newServerlessFunction.id,
              serverlessFunctionVersion: '',
              serverlessFunctionInput: {},
            },
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: {
                value: false,
              },
              retryOnFailure: {
                value: false,
              },
            },
          },
        };
      }
      case WorkflowActionType.SEND_EMAIL: {
        return {
          id: newStepId,
          name: 'Send Email',
          type,
          valid: false,
          settings: {
            input: {
              connectedAccountId: '',
              email: '',
              subject: '',
              body: '',
            },
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: {
                value: false,
              },
              retryOnFailure: {
                value: false,
              },
            },
          },
        };
      }
      case WorkflowActionType.RECORD_CRUD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true },
          });

        return {
          id: newStepId,
          name: 'Create Record',
          type,
          valid: false,
          settings: {
            input: {
              type: WorkflowRecordCRUDType.CREATE,
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecord: {},
            },
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: {
                value: false,
              },
              retryOnFailure: {
                value: false,
              },
            },
          },
        };
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

    const workflowVersion = await workflowVersionRepository.findOneOrFail({
      where: {
        id: workflowVersionId,
      },
    });

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

    const workflowVersion = await workflowVersionRepository.findOneOrFail({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion.steps)) {
      throw new Error("Can't update step from undefined steps");
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
    workflowVersionId,
    stepId,
  }: {
    workflowVersionId: string;
    stepId: string;
  }): Promise<boolean> {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOneOrFail({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion.steps)) {
      throw new Error("Can't update step from undefined steps");
    }

    const workflowVersionUpdates =
      stepId === TRIGGER_STEP_ID
        ? { trigger: null }
        : { steps: workflowVersion.steps.filter((step) => step.id !== stepId) };

    await workflowVersionRepository.update(
      workflowVersion.id,
      workflowVersionUpdates,
    );

    return true;
  }
}
