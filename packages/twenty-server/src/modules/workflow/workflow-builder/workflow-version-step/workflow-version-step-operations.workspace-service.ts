import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  inputSchemaToOutputSchema,
  jsonSchemaToInputSchema,
  SEED_WORKFLOW_ACTION_TRIGGER_SETTINGS,
} from 'twenty-shared/logic-function';
import {
  FieldMetadataType,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';
import {
  WORKFLOW_ACTION_FEATURE_FLAGS,
  WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
  WorkflowActionType,
  getFunctionInputFromInputSchema,
  type StepIfElseBranch,
  workflowMcpToolActionSettingsSchema,
} from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { getLogicFunctionSeedSourceCodeOrThrow } from 'src/engine/core-modules/logic-function/logic-function-resource/utils/get-logic-function-seed-source-code-or-throw.util';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position.input';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { WorkflowAiAgentStepAgentService } from 'src/modules/workflow/workflow-builder/workflow-version-step/services/workflow-ai-agent-step-agent.service';
import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import {
  type WorkflowAction,
  type WorkflowEmptyAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
// A duplicate has no edge to be placed from, so a manual layout keeps it next to its source
const DUPLICATED_STEP_POSITION_OFFSET = 50;

const BASE_STEP_DEFINITION: BaseWorkflowActionSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    continueOnFailure: {
      value: false,
    },
    retryOnFailure: {
      value: 0,
    },
  },
};

@Injectable()
export class WorkflowVersionStepOperationsWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: WorkspaceScopedRepository<ObjectMetadataEntity>,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly findRecordsService: FindRecordsService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workflowAiAgentStepAgentService: WorkflowAiAgentStepAgentService,
  ) {}

  private async findFirstActiveObjectMetadata(workspaceId: string) {
    return this.objectMetadataRepository.findOne(workspaceId, {
      where: { isActive: true, isSystem: false },
    });
  }

  async runStepCreationSideEffectsAndBuildStep({
    type,
    workspaceId,
    position,
    id,
    defaultSettings,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
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

    await this.assertActionTypeEnabled({ type, workspaceId });

    switch (type) {
      case WorkflowActionType.CODE: {
        const defaultInput = defaultSettings?.input as
          | { code?: string; logicFunctionInput?: Record<string, unknown> }
          | undefined;

        return {
          builtStep: {
            ...baseStep,
            name: 'Code - Logic Function',
            type: WorkflowActionType.CODE,
            settings: {
              ...BASE_STEP_DEFINITION,
              outputSchema: {},
              expectedOutputSchema: {},
              input: isString(defaultInput?.code)
                ? {
                    code: defaultInput.code,
                    logicFunctionInput: defaultInput.logicFunctionInput ?? {},
                  }
                : {
                    code: await getLogicFunctionSeedSourceCodeOrThrow(),
                    logicFunctionInput:
                      defaultInput?.logicFunctionInput ??
                      getFunctionInputFromInputSchema(
                        SEED_WORKFLOW_ACTION_TRIGGER_SETTINGS.inputSchema ?? [],
                      )[0] ??
                      {},
                  },
            },
          },
        };
      }
      case WorkflowActionType.LOGIC_FUNCTION: {
        const defaultInput = defaultSettings?.input as
          | {
              logicFunctionId?: string;
              logicFunctionInput?: Record<string, unknown>;
            }
          | undefined;
        const logicFunctionId = defaultInput?.logicFunctionId;

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

        const declaredOutputSchema =
          flatLogicFunction.workflowActionTriggerSettings?.outputSchema;

        const initialOutputSchema: OutputSchema = isDefined(
          declaredOutputSchema,
        )
          ? inputSchemaToOutputSchema(declaredOutputSchema)
          : {};

        return {
          builtStep: {
            ...baseStep,
            name:
              flatLogicFunction.workflowActionTriggerSettings?.label ??
              flatLogicFunction.name,
            type: WorkflowActionType.LOGIC_FUNCTION,
            settings: {
              ...BASE_STEP_DEFINITION,
              outputSchema: initialOutputSchema,
              expectedOutputSchema: {},
              input: {
                logicFunctionId,
                logicFunctionInput:
                  defaultInput?.logicFunctionInput ??
                  (isDefined(
                    flatLogicFunction.workflowActionTriggerSettings
                      ?.inputSchema,
                  )
                    ? (getFunctionInputFromInputSchema(
                        flatLogicFunction.workflowActionTriggerSettings
                          .inputSchema,
                      )[0] ?? {})
                    : {}),
              },
            },
          },
        };
      }
      case WorkflowActionType.MCP_TOOL: {
        const defaultInput = workflowMcpToolActionSettingsSchema.shape.input
          .partial({ toolInput: true })
          .safeParse(defaultSettings?.input);

        if (!defaultInput.success) {
          throw new WorkflowVersionStepException(
            'MCP server ID and tool name are required for MCP_TOOL step',
            WorkflowVersionStepExceptionCode.INVALID_REQUEST,
          );
        }

        const { mcpServerId, toolName, toolInput } = defaultInput.data;

        const { flatMcpServerMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
          );
        const flatMcpServer = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: mcpServerId,
          flatEntityMaps: flatMcpServerMaps,
        });
        const tool = flatMcpServer?.tools.find(
          (candidate) => candidate.name === toolName,
        );

        if (!isDefined(flatMcpServer) || !isDefined(tool)) {
          throw new WorkflowVersionStepException(
            `MCP server ${mcpServerId} has no tool named ${toolName}`,
            WorkflowVersionStepExceptionCode.INVALID_REQUEST,
          );
        }

        return {
          builtStep: {
            ...baseStep,
            name: tool.annotations?.title ?? tool.name,
            type: WorkflowActionType.MCP_TOOL,
            settings: {
              ...BASE_STEP_DEFINITION,
              outputSchema: {},
              expectedOutputSchema: {},
              input: {
                mcpServerId,
                toolName,
                toolInput:
                  toolInput ??
                  getFunctionInputFromInputSchema(
                    jsonSchemaToInputSchema(tool.inputSchema),
                  )[0] ??
                  {},
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
      case WorkflowActionType.SEND_CHAT_MESSAGE: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Send to Inbox',
            type: WorkflowActionType.SEND_CHAT_MESSAGE,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                workspaceMemberId: '',
                title: '',
                text: '',
              },
            },
          },
        };
      }
      case WorkflowActionType.CREATE_CALENDAR_EVENT: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Create Calendar Event',
            type: WorkflowActionType.CREATE_CALENDAR_EVENT,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                connectedAccountId: '',
                title: '',
                description: '',
                location: '',
                startsAt: '',
                endsAt: '',
                isFullDay: false,
                timeZone: '',
                attendees: '',
                sendInvitations: false,
                addConferencing: false,
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
          await this.findFirstActiveObjectMetadata(workspaceId);

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
          await this.findFirstActiveObjectMetadata(workspaceId);

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
          await this.findFirstActiveObjectMetadata(workspaceId);

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
          await this.findFirstActiveObjectMetadata(workspaceId);

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
              },
            },
          },
        };
      }
      case WorkflowActionType.FIND_RECORDS: {
        const activeObjectMetadataItem =
          await this.findFirstActiveObjectMetadata(workspaceId);

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
                offset: 0,
              },
            },
          },
        };
      }
      case WorkflowActionType.PICK_RECORD: {
        const activeObjectMetadataItem =
          await this.findFirstActiveObjectMetadata(workspaceId);

        return {
          builtStep: {
            ...baseStep,
            name: 'Pick Record',
            type: WorkflowActionType.PICK_RECORD,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                objectName: activeObjectMetadataItem?.nameSingular || '',
                strategy: 'RANDOM',
                recordIds: [],
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
              expectedOutputSchema: {},
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
        const defaultAgentInput = defaultSettings?.input;
        const defaultAgentId = isPlainObject(defaultAgentInput)
          ? defaultAgentInput.agentId
          : undefined;
        // the prompt is the user's own text, so switching an AI step's kind or agent keeps it
        const defaultPrompt =
          isPlainObject(defaultAgentInput) && isString(defaultAgentInput.prompt)
            ? defaultAgentInput.prompt
            : '';

        if (isNonEmptyString(defaultAgentId)) {
          const agent =
            await this.workflowAiAgentStepAgentService.findAgentRunnableByNewStepOrThrow(
              { agentId: defaultAgentId, workspaceId },
            );

          return {
            builtStep: {
              ...baseStep,
              name: agent.label,
              type: WorkflowActionType.AI_AGENT,
              settings: {
                ...BASE_STEP_DEFINITION,
                input: {
                  agentId: agent.id,
                  prompt: defaultPrompt,
                },
              },
            },
          };
        }

        return {
          builtStep: {
            ...baseStep,
            name: WORKFLOW_AI_AGENT_GENERATE_STEP_DEFAULT_NAME,
            type: WorkflowActionType.AI_AGENT,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                instructions: '',
                prompt: defaultPrompt,
              },
            },
          },
        };
      }
      case WorkflowActionType.CLASSIFY: {
        return {
          builtStep: {
            ...baseStep,
            name: 'Classify',
            type: WorkflowActionType.CLASSIFY,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                state: '',
                questions: [
                  {
                    id: v4(),
                    name: '',
                    type: 'choice',
                    instructions: '',
                    criteria: [
                      {
                        id: v4(),
                        name: 'Lawyer',
                        description: 'Advises clients on legal matters',
                      },
                    ],
                  },
                ],
              },
            },
          },
        };
      }
      case WorkflowActionType.ITERATOR: {
        const emptyNodeStep = this.buildEmptyNodeForIteratorStep({
          iteratorStepId: baseStep.id,
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
                shouldContinueOnIterationFailure: true,
              },
            },
          },
          additionalCreatedSteps: [emptyNodeStep],
        };
      }
      case WorkflowActionType.IF_ELSE: {
        const { ifEmptyNode, elseEmptyNode, ifFilterGroupId, branches } =
          this.buildEmptyNodesForIfElseStep();

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
      case WorkflowActionType.WAIT_FOR_EVENT: {
        const activeObjectMetadataItem =
          await this.findFirstActiveObjectMetadata(workspaceId);

        return {
          builtStep: {
            ...baseStep,
            name: 'Wait for Event',
            type: WorkflowActionType.WAIT_FOR_EVENT,
            settings: {
              ...BASE_STEP_DEFINITION,
              input: {
                eventName: `${activeObjectMetadataItem?.nameSingular ?? 'company'}.updated`,
                recordId: null,
                timeout: null,
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

  private async assertActionTypeEnabled({
    type,
    workspaceId,
  }: {
    type: WorkflowActionType;
    workspaceId: string;
  }) {
    const featureFlag = WORKFLOW_ACTION_FEATURE_FLAGS[type];

    if (
      isDefined(featureFlag) &&
      !(await this.featureFlagService.isFeatureEnabled(
        featureFlag,
        workspaceId,
      ))
    ) {
      throw new WorkflowVersionStepException(
        `WorkflowActionType '${type}' is not enabled`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }
  }

  async enrichFormStepResponse({
    workspaceId,
    step,
    response,
    recordReadContext,
  }: {
    workspaceId: string;
    step: WorkflowFormAction;
    response: Record<string, unknown>;
    recordReadContext?: Pick<WorkflowExecutionContext, 'authContext'>;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const responseKeys = Object.keys(response);

      const enrichedResponses = await Promise.all(
        responseKeys.map(async (key) => {
          const value = response[key];

          if (!isDefined(value)) {
            return { key, value };
          }

          const field = step.settings.input.find((field) => field.name === key);
          const recordId = isPlainObject(value) ? value.id : undefined;

          if (
            field?.type === 'RECORD' &&
            field?.settings?.objectName &&
            isString(recordId) &&
            isValidUuid(recordId)
          ) {
            if (isDefined(recordReadContext)) {
              return {
                key,
                value: await this.findSelectedRecordOrThrow({
                  objectName: field.settings.objectName,
                  recordId,
                  recordReadContext,
                }),
              };
            }

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
              this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
                field.settings.objectName,
              );

            const record = await repository.findOne({
              where: { id: recordId },
              relations: relationFieldsNames,
            });

            return { key, value: record };
          }
          return { key, value };
        }),
      );

      return enrichedResponses.reduce<Record<string, unknown>>(
        (acc, { key, value }) => {
          acc[key] = value;

          return acc;
        },
        {},
      );
    }, authContext);
  }

  private async findSelectedRecordOrThrow({
    objectName,
    recordId,
    recordReadContext,
  }: {
    objectName: string;
    recordId: string;
    recordReadContext: Pick<WorkflowExecutionContext, 'authContext'>;
  }) {
    const { success, result } = await this.findRecordsService.execute({
      objectName,
      filter: { id: { eq: recordId } },
      limit: 1,
      authContext: recordReadContext.authContext,
      shouldBuildEffectiveSelectFields: false,
    });

    const record = success ? result?.records[0] : undefined;

    if (!isDefined(record)) {
      throw new WorkflowVersionStepException(
        `Record ${recordId} of ${objectName} cannot be read with the permissions of this run`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`You cannot select this record in this form.`,
        },
      );
    }

    return record;
  }

  async cloneStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    await this.assertActionTypeEnabled({ type: step.type, workspaceId });

    switch (step.type) {
      case WorkflowActionType.ITERATOR: {
        return {
          ...step,
          id: v4(),
          nextStepIds: [],
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
        };
      }
    }
  }

  markStepAsDuplicate({ step }: { step: WorkflowAction }): WorkflowAction {
    return {
      ...step,
      name: `${step.name} (Duplicate)`,
      position: isDefined(step.position)
        ? {
            x: step.position.x + DUPLICATED_STEP_POSITION_OFFSET,
            y: step.position.y + DUPLICATED_STEP_POSITION_OFFSET,
          }
        : undefined,
    };
  }

  buildEmptyNodeForIteratorStep({
    iteratorStepId,
  }: {
    iteratorStepId: string;
  }): WorkflowAction {
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
    };

    return emptyNodeStep;
  }

  buildEmptyNodesForIfElseStep(): {
    ifEmptyNode: WorkflowAction;
    elseEmptyNode: WorkflowAction;
    ifFilterGroupId: string;
    branches: StepIfElseBranch[];
  } {
    const ifEmptyNode: WorkflowEmptyAction = {
      id: v4(),
      name: 'Add an Action',
      type: WorkflowActionType.EMPTY,
      valid: true,
      settings: {
        ...BASE_STEP_DEFINITION,
        input: {},
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
    };

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
  }
}
