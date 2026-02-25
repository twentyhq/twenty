import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  FieldMetadataType,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import {
  IF_ELSE_BRANCH_POSITION_OFFSETS,
  getFunctionInputFromInputSchema,
  type StepIfElseBranch,
} from 'twenty-shared/workflow';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-input.dto';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly logicFunctionFromSourceService: LogicFunctionFromSourceService,
    private readonly codeStepBuildService: CodeStepBuildService,
    private readonly agentService: AgentService,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly aiAgentRoleService: AiAgentRoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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
        await this.logicFunctionFromSourceService.deleteOneWithSource({
          id: step.settings.input.logicFunctionId,
          workspaceId,
        });
        break;
      }
      case WorkflowActionType.AI_AGENT: {
        if (!isDefined(step.settings.input.agentId)) {
          break;
        }

        const roleTarget = await this.roleTargetRepository.findOne({
          where: {
            agentId: step.settings.input.agentId,
            workspaceId,
          },
        });

        await this.agentService.deleteManyAgents({
          ids: [step.settings.input.agentId],
          workspaceId,
        });

        if (isDefined(roleTarget?.roleId) && isDefined(roleTarget?.id)) {
          await this.aiAgentRoleService.deleteAgentOnlyRoleIfUnused({
            roleId: roleTarget.roleId,
            roleTargetId: roleTarget.id,
            workspaceId,
          });
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
    defaultSettings,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
    workflowVersionId: string;
    position?: WorkflowStepPositionInput;
    id?: string;
    defaultSettings?: Record<string, unknown>;
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
        const logicFunctionId = id ?? v4();

        const newLogicFunction =
          await this.codeStepBuildService.createCodeStepLogicFunction({
            logicFunctionId,
            workspaceId,
          });

        if (!isDefined(newLogicFunction)) {
          throw new WorkflowVersionStepException(
            'Fail to create Code Step',
            WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE,
          );
        }

        return {
          builtStep: {
            ...baseStep,
            name: 'Code - Logic Function',
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
                logicFunctionId: newLogicFunction.id,
                logicFunctionInput: isDefined(newLogicFunction.toolInputSchema)
                  ? (getFunctionInputFromInputSchema([
                      newLogicFunction.toolInputSchema,
                    ])[0] ?? {})
                  : {},
              },
            },
          },
        };
      }
      case WorkflowActionType.LOGIC_FUNCTION: {
        const logicFunctionId = (
          defaultSettings?.input as { logicFunctionId: string } | undefined
        )?.logicFunctionId;

        if (!isDefined(logicFunctionId)) {
          throw new WorkflowVersionStepException(
            'Logic function ID is required for LOGIC_FUNCTION step',
            WorkflowVersionStepExceptionCode.INVALID_REQUEST,
          );
        }

        const { flatLogicFunctionMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            {
              workspaceId,
              flatMapsKeys: ['flatLogicFunctionMaps'],
            },
          );

        const flatLogicFunction = findFlatLogicFunctionOrThrow({
          id: logicFunctionId,
          flatLogicFunctionMaps,
        });

        return {
          builtStep: {
            ...baseStep,
            name: flatLogicFunction.name,
            type: WorkflowActionType.LOGIC_FUNCTION,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                logicFunctionId,
                logicFunctionInput: {},
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
                recipients: {
                  to: '',
                  cc: '',
                  bcc: '',
                },
                subject: '',
                body: '',
              },
            },
          },
        };
      }
      case WorkflowActionType.DRAFT_EMAIL: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Draft Email',
            type: WorkflowActionType.DRAFT_EMAIL,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                connectedAccountId: '',
                recipients: {
                  to: '',
                  cc: '',
                  bcc: '',
                },
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
      case WorkflowActionType.UPSERT_RECORD: {
        const activeObjectMetadataItem =
          await this.objectMetadataRepository.findOne({
            where: { workspaceId, isActive: true, isSystem: false },
          });

        return {
          builtStep: {
            ...baseStep,
            name: 'Create or Update Record',
            type: WorkflowActionType.UPSERT_RECORD,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                objectName: activeObjectMetadataItem?.nameSingular || '',
                objectRecord: {},
                fieldsToUpdate: [],
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
        const workflowVersion =
          await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
            workflowVersionId,
            workspaceId,
          });

        const newAgent = await this.agentService.createOneAgent(
          {
            label:
              'Workflow Agent' + workflowVersion.workflowId.substring(0, 4),
            icon: 'IconRobot',
            description: '',
            prompt:
              'You are a helpful AI assistant. Complete the task based on the workflow context.',
            modelId: DEFAULT_SMART_MODEL,
            responseFormat: { type: 'text' },
            isCustom: true,
          },
          workspaceId,
        );

        return {
          builtStep: {
            ...baseStep,
            name: 'AI Agent',
            type: WorkflowActionType.AI_AGENT,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                agentId: newAgent.id,
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
      case WorkflowActionType.IF_ELSE: {
        const { ifEmptyNode, elseEmptyNode, ifFilterGroupId, branches } =
          await this.createEmptyNodesForIfElseStep({
            workflowVersionId,
            workspaceId,
            ifElsePosition: position,
          });

        const initialFilterId = v4();

        return {
          builtStep: {
            ...baseStep,
            name: 'If/Else',
            type: WorkflowActionType.IF_ELSE,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                stepFilterGroups: [
                  {
                    id: ifFilterGroupId,
                    logicalOperator: StepLogicalOperator.AND,
                  },
                ],
                stepFilters: [
                  {
                    id: initialFilterId,
                    type: 'unknown',
                    stepOutputKey: '',
                    operand: ViewFilterOperand.IS,
                    value: '',
                    stepFilterGroupId: ifFilterGroupId,
                    positionInStepFilterGroup: 0,
                  },
                ],
                branches,
              },
            },
          },
          additionalCreatedSteps: [ifEmptyNode, elseEmptyNode],
        };
      }
      case WorkflowActionType.DELAY: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Delay',
            type: WorkflowActionType.DELAY,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                delayType: 'DURATION',
                duration: {
                  days: 0,
                  hours: 0,
                  minutes: 0,
                  seconds: 0,
                },
              },
            },
          },
        };
      }
      case WorkflowActionType.EMPTY: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Add an Action',
            type: WorkflowActionType.EMPTY,
            valid: true,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {},
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

  async enrichFormStepResponse({
    workspaceId,
    step,
    response,
  }: {
    workspaceId: string;
    step: WorkflowFormAction;
    response: object;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const responseKeys = Object.keys(response);

        const enrichedResponses = await Promise.all(
          responseKeys.map(async (key) => {
            // @ts-expect-error legacy noImplicitAny
            if (!isDefined(response[key])) {
              // @ts-expect-error legacy noImplicitAny
              return { key, value: response[key] };
            }

            const field = step.settings.input.find(
              (field) => field.name === key,
            );

            if (
              field?.type === 'RECORD' &&
              field?.settings?.objectName &&
              // @ts-expect-error legacy noImplicitAny
              isDefined(response[key].id) &&
              // @ts-expect-error legacy noImplicitAny
              isValidUuid(response[key].id)
            ) {
              const { flatObjectMetadata, flatFieldMetadataMaps } =
                await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
                  field.settings.objectName,
                  workspaceId,
                );

              const relationFieldsNames = getFlatFieldsFromFlatObjectMetadata(
                flatObjectMetadata,
                flatFieldMetadataMaps,
              )
                .filter((field) => field.type === FieldMetadataType.RELATION)
                .map((field) => field.name);

              const repository =
                await this.globalWorkspaceOrmManager.getRepository(
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
      },
      authContext,
    );
  }

  async cloneStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    const duplicatedStepPosition = {
      x: step.position?.x ?? 0,
      y: step.position?.y ?? 0,
    };

    switch (step.type) {
      case WorkflowActionType.CODE: {
        const newLogicFunction =
          await this.codeStepBuildService.duplicateCodeStepLogicFunction({
            existingLogicFunctionId: step.settings.input.logicFunctionId,
            workspaceId,
          });

        return {
          ...step,
          id: v4(),
          nextStepIds: [],
          position: duplicatedStepPosition,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              logicFunctionId: newLogicFunction.id,
            },
          },
        };
      }
      case WorkflowActionType.AI_AGENT: {
        const agentId = step.settings.input.agentId;

        if (!isDefined(agentId)) {
          throw new WorkflowVersionStepException(
            'Agent ID is required for cloning',
            WorkflowVersionStepExceptionCode.AI_AGENT_STEP_FAILURE,
          );
        }

        const existingAgent = await this.agentService.findOneAgentById({
          id: agentId,
          workspaceId,
        });

        const clonedAgent = await this.agentService.createOneAgent(
          {
            label: existingAgent.label,
            icon: existingAgent.icon ?? undefined,
            description: existingAgent.description ?? undefined,
            prompt: existingAgent.prompt,
            modelId: existingAgent.modelId,
            responseFormat: existingAgent.responseFormat ?? undefined,
            modelConfiguration: existingAgent.modelConfiguration ?? undefined,
            isCustom: true,
          },
          workspaceId,
        );

        return {
          ...step,
          id: v4(),
          nextStepIds: [],
          position: duplicatedStepPosition,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              agentId: clonedAgent.id,
            },
          },
        };
      }
      case WorkflowActionType.ITERATOR: {
        return {
          ...step,
          id: v4(),
          nextStepIds: [],
          position: duplicatedStepPosition,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              initialLoopStepIds: [],
            },
          },
        };
      }
      default: {
        return {
          ...step,
          id: v4(),
          nextStepIds: [],
          position: duplicatedStepPosition,
        };
      }
    }
  }

  markStepAsDuplicate({ step }: { step: WorkflowAction }): WorkflowAction {
    return {
      ...step,
      name: `${step.name} (Duplicate)`,
      position: {
        x: (step.position?.x ?? 0) + DUPLICATED_STEP_POSITION_OFFSET,
        y: (step.position?.y ?? 0) + DUPLICATED_STEP_POSITION_OFFSET,
      },
    };
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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
          name: 'Add an Action',
          type: WorkflowActionType.EMPTY,
          valid: true,
          nextStepIds: [iteratorStepId],
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {},
          },
          position: {
            x:
              (iteratorPosition?.x ?? 0) +
              ITERATOR_EMPTY_STEP_POSITION_OFFSET.x,
            y:
              (iteratorPosition?.y ?? 0) +
              ITERATOR_EMPTY_STEP_POSITION_OFFSET.y,
          },
        };

        await workflowVersionRepository.update(workflowVersion.id, {
          steps: [...existingSteps, emptyNodeStep],
        });

        return emptyNodeStep;
      },
      authContext,
    );
  }

  async createEmptyNodesForIfElseStep({
    workflowVersionId,
    workspaceId,
    ifElsePosition,
  }: {
    workflowVersionId: string;
    workspaceId: string;
    ifElsePosition?: WorkflowStepPositionInput;
  }): Promise<{
    ifEmptyNode: WorkflowAction;
    elseEmptyNode: WorkflowAction;
    ifFilterGroupId: string;
    branches: StepIfElseBranch[];
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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

        const ifEmptyNode: WorkflowEmptyAction = {
          id: v4(),
          name: 'Add an Action',
          type: WorkflowActionType.EMPTY,
          valid: true,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {},
          },
          position: {
            x: (ifElsePosition?.x ?? 0) + IF_ELSE_BRANCH_POSITION_OFFSETS.IF.x,
            y: (ifElsePosition?.y ?? 0) + IF_ELSE_BRANCH_POSITION_OFFSETS.IF.y,
          },
        };

        const elseEmptyNode: WorkflowEmptyAction = {
          id: v4(),
          name: 'Add an Action',
          type: WorkflowActionType.EMPTY,
          valid: true,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {},
          },
          position: {
            x:
              (ifElsePosition?.x ?? 0) + IF_ELSE_BRANCH_POSITION_OFFSETS.ELSE.x,
            y:
              (ifElsePosition?.y ?? 0) + IF_ELSE_BRANCH_POSITION_OFFSETS.ELSE.y,
          },
        };

        await workflowVersionRepository.update(workflowVersion.id, {
          steps: [...existingSteps, ifEmptyNode, elseEmptyNode],
        });

        const ifFilterGroupId = v4();

        const branches: StepIfElseBranch[] = [
          {
            id: v4(),
            filterGroupId: ifFilterGroupId,
            nextStepIds: [ifEmptyNode.id],
          },
          {
            id: v4(),
            nextStepIds: [elseEmptyNode.id],
          },
        ];

        return {
          ifEmptyNode,
          elseEmptyNode,
          ifFilterGroupId,
          branches,
        };
      },
      authContext,
    );
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
        const newLogicFunction =
          await this.codeStepBuildService.duplicateCodeStepLogicFunction({
            existingLogicFunctionId: step.settings.input.logicFunctionId,
            workspaceId,
          });

        return {
          ...step,
          settings: {
            ...step.settings,
            input: {
              ...step.settings.input,
              logicFunctionId: newLogicFunction.id,
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
