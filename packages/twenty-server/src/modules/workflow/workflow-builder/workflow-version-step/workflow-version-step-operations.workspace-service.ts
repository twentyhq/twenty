import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { BASE_TYPESCRIPT_PROJECT_INPUT_SCHEMA } from 'src/engine/core-modules/serverless/drivers/constants/base-typescript-project-input-schema';
import { type WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-input.dto';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowEmptyAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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

const ITERATOR_EMPTY_STEP_POSITION_OFFSET = {
  x: 174,
  y: 83,
};

@Injectable()
export class WorkflowVersionStepOperationsWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async runWorkflowVersionStepDeletionSideEffects({
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

  async runStepCreationSideEffectsAndBuildStep({
    type,
    workspaceId,
    workflowVersionId,
    position,
    id,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
    workflowVersionId: string;
    position?: WorkflowStepPositionInput;
    id?: string;
  }): Promise<{
    builtStep: WorkflowAction;
    additionalCreatedSteps?: WorkflowAction[];
  }> {
    const baseStep = {
      id: id || v4(),
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
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.SEND_EMAIL: {
        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.CREATE_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.UPDATE_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.DELETE_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.FIND_RECORDS: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.FORM: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Form',
            type: WorkflowActionType.FORM,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: [],
            },
          },
        };
      }
      case WorkflowActionType.FILTER: {
        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.HTTP_REQUEST: {
        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.AI_AGENT: {
        return {
          builtStep: {
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
          },
        };
      }
      case WorkflowActionType.ITERATOR: {
        const emptyNodeStep = await this.createEmptyNodeForIteratorStep({
          iteratorStepId: baseStep.id,
          workflowVersionId,
          workspaceId,
          iteratorPosition: position,
        });

        return {
          builtStep: {
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
          },
          additionalCreatedSteps: [emptyNodeStep],
        };
      }
      default:
        throw new WorkflowVersionStepException(
          `WorkflowActionType '${type}' unknown`,
          WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        );
    }
  }

  async enrichFormStepResponse({
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

  async createStepForDuplicate({
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

  async createEmptyNodeForIteratorStep({
    iteratorStepId,
    workflowVersionId,
    workspaceId,
    iteratorPosition,
  }: {
    iteratorStepId: string;
    workflowVersionId: string;
    workspaceId: string;
    iteratorPosition?: WorkflowStepPositionInput;
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
      position: {
        x: (iteratorPosition?.x ?? 0) + ITERATOR_EMPTY_STEP_POSITION_OFFSET.x,
        y: (iteratorPosition?.y ?? 0) + ITERATOR_EMPTY_STEP_POSITION_OFFSET.y,
      },
    };

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: [...existingSteps, emptyNodeStep],
    });

    return emptyNodeStep;
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
}
