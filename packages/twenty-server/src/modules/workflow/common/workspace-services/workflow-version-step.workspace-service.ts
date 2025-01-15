import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { BASE_TYPESCRIPT_PROJECT_INPUT_SCHEMA } from 'src/engine/core-modules/serverless/drivers/constants/base-typescript-project-input-schema';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
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
import { WorkflowBuilderWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-builder.workspace-service';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { isDefined } from 'src/utils/is-defined';

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
      default:
        throw new WorkflowVersionStepException(
          `WorkflowActionType '${type}' unknown`,
          WorkflowVersionStepExceptionCode.UNKNOWN,
        );
    }
  }

  private async duplicateStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    const newStepId = v4();

    switch (step.type) {
      case WorkflowActionType.CODE: {
        const copiedServerlessFunction =
          await this.serverlessFunctionService.copyOneServerlessFunction({
            serverlessFunctionToCopyId:
              step.settings.input.serverlessFunctionId,
            serverlessFunctionToCopyVersion:
              step.settings.input.serverlessFunctionVersion,
            workspaceId,
          });

        return {
          ...step,
          id: newStepId,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              serverlessFunctionId: copiedServerlessFunction.id,
              serverlessFunctionVersion: copiedServerlessFunction.latestVersion,
            },
          },
        };
      }
      default: {
        return {
          ...step,
          id: newStepId,
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

    await this.runWorkflowVersionStepDeletionSideEffects({
      step: stepToDelete,
      workspaceId,
    });

    return stepToDelete;
  }

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
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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

      draftWorkflowVersion = await workflowVersionRepository.save({
        workflowId,
        name: `v${workflowVersionsCount + 1}`,
        status: WorkflowVersionStatus.DRAFT,
      });
    }

    assertWorkflowVersionIsDraft(draftWorkflowVersion);

    if (Array.isArray(draftWorkflowVersion.steps)) {
      await Promise.all(
        draftWorkflowVersion.steps.map((step) =>
          this.runWorkflowVersionStepDeletionSideEffects({
            step,
            workspaceId,
          }),
        ),
      );
    }

    const newWorkflowVersionTrigger = workflowVersionToCopy.trigger;
    const newWorkflowVersionSteps: WorkflowAction[] = [];

    for (const step of workflowVersionToCopy.steps) {
      const duplicatedStep = await this.duplicateStep({
        step,
        workspaceId,
      });

      newWorkflowVersionSteps.push(duplicatedStep);
    }

    await workflowVersionRepository.update(draftWorkflowVersion.id, {
      steps: newWorkflowVersionSteps,
      trigger: newWorkflowVersionTrigger,
    });
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
}
