import { Injectable, Logger } from '@nestjs/common';

import { convertToModelMessages, hasToolCall } from 'ai';
import {
  ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME,
  COMPLETE_WORKSPACE_SETUP_TOOL_NAME,
  type ExtendedUIMessage,
  NO_REPLY_TOOL_NAME,
  REACT_TO_MESSAGE_TOOL_NAME,
  extractRecordReferenceIds,
} from 'twenty-shared/ai';
import { type APP_LOCALES } from 'twenty-shared/translations';
import {
  AppPath,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { type CodeExecutionStreamEmitter } from 'src/engine/core-modules/tool-provider/interfaces/code-execution-stream-emitter.type';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { type AgentStepLoopInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-step-loop.service';
import {
  type AgentTurn,
  AgentTurnService,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-turn.service';
import { guideUncallableToolCallsToMetaTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/guide-uncallable-tool-calls-to-meta-tool.util';
import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/replace-unsupported-file-parts.util';
import { type BrowsingContextType } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';
import { AGENT_CHAT_KEEPALIVE_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-keepalive-interval-ms.constant';
import { AI_CHAT_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-excluded-tool-names.const';
import { AI_CHAT_STREAM_FUNCTION_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-stream-function-id.constant';
import { AI_CHAT_TOOL_NAMES_TO_PRELOAD } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-tool-names-to-preload.const';
import { AI_CHAT_WORKSPACE_SETUP_STREAM_FUNCTION_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-workspace-setup-stream-function-id.constant';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentChatMessageReactionService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-message-reaction.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { MessagePruningService } from 'src/engine/metadata-modules/ai/ai-chat/services/message-pruning.service';
import { createAttachConversationToRecordTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';
import { createReactToMessageTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/react-to-message.tool';
import { createCompleteWorkspaceSetupTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/complete-workspace-setup.tool';
import { createNoReplyTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/no-reply.tool';
import { type AgentChatSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-sender.type';
import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';
import { buildFullSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-full-system-prompt.util';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { collectReferencedSkillIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-referenced-skill-ids.util';
import { collectUploadedFileReferences } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-uploaded-file-references.util';
import { createTurnAuthorizer } from 'src/engine/metadata-modules/ai/ai-chat/utils/create-turn-authorizer.util';
import { extractCodeInterpreterFiles } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-code-interpreter-files.util';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { hasNoAssistantMessage } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-no-assistant-message.util';
import { hasSucceededWorkspaceSetupCompletion } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-succeeded-workspace-setup-completion.util';
import { injectChatMessageSenders } from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-chat-message-senders.util';
import { injectMessageTimestamps } from 'src/engine/metadata-modules/ai/ai-chat/utils/inject-message-timestamps.util';
import { splitContextInstructions } from 'src/engine/metadata-modules/ai/ai-chat/utils/split-context-instructions.util';
import { tagAiChatExecutionScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-execution-scope.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type ChatExecutionOptions = {
  workspace: WorkspaceEntity;
  userWorkspaceId: string;
  sender: AgentChatSender;
  authorization: Awaited<ReturnType<AgentChatActorService['authorize']>>;
  threadId: string;
  streamId: string;
  turnId: string;
  messages: ExtendedUIMessage[];
  browsingContext: BrowsingContextType | null;
  onCodeExecutionUpdate: CodeExecutionStreamEmitter;
  onCompaction: () => void;
  modelId?: string;
  abortSignal: AbortSignal;
  conversationSizeTokens: number;
  onUserCreditsExhausted: NonNullable<
    AgentStepLoopInput['onUserCreditsExhausted']
  >;
};

type ChatExecutionResult = Pick<
  AgentTurn,
  'stream' | 'modelConfig' | 'getStopReason'
> & {
  getStreamError: () => unknown;
};

@Injectable()
export class ChatExecutionService {
  private readonly logger = new Logger(ChatExecutionService.name);

  constructor(
    private readonly skillService: SkillService,
    private readonly agentActorContextService: AgentActorContextService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly messagePruningService: MessagePruningService,
    private readonly chatActorService: AgentChatActorService,
    private readonly agentChatThreadTargetService: AgentChatThreadTargetService,
    private readonly agentChatMessageReactionService: AgentChatMessageReactionService,
    private readonly agentChatThreadParticipantService: AgentChatThreadParticipantService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly agentTurnService: AgentTurnService,
  ) {}

  async streamChat({
    workspace,
    userWorkspaceId,
    sender,
    authorization,
    threadId,
    streamId,
    turnId,
    messages,
    browsingContext,
    onCodeExecutionUpdate,
    onCompaction,
    modelId,
    abortSignal,
    conversationSizeTokens,
    onUserCreditsExhausted,
  }: ChatExecutionOptions): Promise<ChatExecutionResult> {
    const getAuthorization = createTurnAuthorizer({
      authorize: () =>
        this.chatActorService.authorize({
          workspaceId: workspace.id,
          threadId,
          sender,
        }),
      authorization,
      maxAgeMs: AGENT_CHAT_KEEPALIVE_INTERVAL_MS,
    });
    const resolveExecutionContext = async (): Promise<ToolContext> => ({
      ...toolContext,
      ...(await getAuthorization()),
      resolveExecutionContext: undefined,
    });
    const { actorContext, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspace.id,
      );

    const locale = userContext.locale as keyof typeof APP_LOCALES;

    const toolContext: ToolContext = {
      workspaceId: workspace.id,
      actorContext,
      userId,
      userWorkspaceId,
      threadId,
      locale,
      onCodeExecutionUpdate,
      ...authorization,
      resolveExecutionContext,
    };

    const isWorkspaceSetupConversation =
      threadId ===
      buildWorkspaceSetupChatThreadId({
        workspaceId: workspace.id,
        userWorkspaceId,
      });

    const isWorkspaceSetupThread =
      isWorkspaceSetupConversation &&
      !hasSucceededWorkspaceSetupCompletion(messages);

    const isWorkspaceSetupKickoffTurn =
      isWorkspaceSetupThread && hasNoAssistantMessage(messages);

    const isAiChatInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      workspace.id,
    );

    // judged on the conversation, not setup status: onboarding continues here after setup completes
    const isInboxConversation =
      !isWorkspaceSetupConversation && isAiChatInboxEnabled;

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === AgentMessageRole.USER);

    // Members mentioned in this message are only added once the turn is queued
    const isGroupConversation =
      isInboxConversation &&
      (await this.agentChatThreadParticipantService.countMembers({
        workspaceId: workspace.id,
        threadId,
        additionalWorkspaceMemberIds: extractRecordReferenceIds({
          text: findLastMessageText(latestUserMessage?.parts ?? []) ?? '',
          objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
        }),
      })) > 1;

    let lastUnderlyingStreamError: unknown;

    const turn = await this.agentTurnService.start({
      workspace,
      modelId: getChatModelId({ requestedModelId: modelId, workspace }),
      toolset: {
        registryAccess: {
          type: 'assistant',
          toolContext,
          excludedToolNames: AI_CHAT_EXCLUDED_TOOL_NAMES,
          preloadedToolNames: AI_CHAT_TOOL_NAMES_TO_PRELOAD,
        },
        canAskHumans: true,
        isWorkspaceSetupThread,
        extraTools: {
          ...(isWorkspaceSetupThread
            ? {
                [COMPLETE_WORKSPACE_SETUP_TOOL_NAME]:
                  createCompleteWorkspaceSetupTool(),
              }
            : {}),
          ...(isGroupConversation
            ? { [NO_REPLY_TOOL_NAME]: createNoReplyTool() }
            : {}),
          ...(isInboxConversation
            ? {
                [ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME]:
                  createAttachConversationToRecordTool({
                    agentChatThreadTargetService:
                      this.agentChatThreadTargetService,
                    toolContext,
                  }),
              }
            : {}),
          ...(isAiChatInboxEnabled && isDefined(latestUserMessage)
            ? {
                [REACT_TO_MESSAGE_TOOL_NAME]: createReactToMessageTool({
                  reactToLatestMemberMessage: (emoji) =>
                    this.agentChatMessageReactionService.addAssistantReaction({
                      messageId: latestUserMessage.id,
                      emoji,
                      workspaceId: workspace.id,
                      agentId: null,
                    }),
                }),
              }
            : {}),
        },
      },
      buildContext: async ({ registeredModel, modelConfig, toolset }) => {
        tagAiChatExecutionScope({
          isWorkspaceSetupThread,
          modelId: registeredModel.modelId,
        });

        const { preparedMessages, codeInterpreterFiles } = this.prepareMessages(
          {
            workspace,
            messages,
            modelConfig,
            browsingContext,
            workspaceMemberId: authorization.authContext.workspaceMemberId,
            timezone: userContext.timezone,
          },
        );
        const { contexts, conversation } = splitContextInstructions(
          await convertToModelMessages(
            this.sanitizeMessagePartsForModel(
              preparedMessages,
              new Set(Object.keys(toolset.tools)),
            ),
          ),
        );

        const pruningResult =
          this.messagePruningService.pruneIfOverContextWindowLimit(
            conversation,
            modelConfig.contextWindowTokens,
            conversationSizeTokens,
          );

        if (pruningResult.isStillOverLimit) {
          throw new AiException(
            'This conversation is too long for the model to process. Please start a new thread.',
            AiExceptionCode.CONTEXT_WINDOW_EXCEEDED,
          );
        }

        if (pruningResult.wasPruned) {
          onCompaction();
        }

        return {
          systemPrompt: buildFullSystemPrompt({
            toolCatalog: toolset.toolCatalog,
            skillCatalog: await this.skillService.findAllFlatSkills(
              workspace.id,
            ),
            // inline tagged skills to save the model a load_skills round trip
            referencedSkills: await this.skillService.findFlatSkillsByIds(
              collectReferencedSkillIds(messages),
              workspace.id,
            ),
            preloadedTools: toolset.directToolNames,
            uploadedFilesContext: {
              uploadedFiles: collectUploadedFileReferences(messages),
              codeInterpreterFiles,
            },
            workspaceInstructions:
              workspace.aiAdditionalInstructions ?? undefined,
            userContext,
            userWorkspaceId,
            workspaceId: workspace.id,
            isWorkspaceSetupThread,
            canAttachConversationToRecords: isInboxConversation,
          }),
          contextMessages: contexts,
          messages: pruningResult.messages,
        };
      },
      promptCacheKey: threadId,
      shouldIncludeReasoningSummary: true,
      // Every step of the kickoff turn is forced so it cannot end in prose; stopWhen ends it at the first pausing tool call.
      toolChoice: isWorkspaceSetupKickoffTurn ? 'required' : 'auto',
      abortSignal,
      shouldStopAfterStep: hasToolCall(
        COMPLETE_WORKSPACE_SETUP_TOOL_NAME,
        NO_REPLY_TOOL_NAME,
      ),
      billing: {
        workspaceId: workspace.id,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        webSearchOperationType: UsageOperationType.WEB_SEARCH,
        spenders: { userWorkspaceId },
      },
      onUserCreditsExhausted,
      telemetry: {
        functionId: isWorkspaceSetupThread
          ? AI_CHAT_WORKSPACE_SETUP_STREAM_FUNCTION_ID
          : AI_CHAT_STREAM_FUNCTION_ID,
        workspaceId: workspace.id,
        userWorkspaceId,
        threadId,
        turnId,
        streamId,
      },
      beforeStep: getAuthorization,
      metricsScope: 'chat',
      onError: (error) => {
        lastUnderlyingStreamError = error;
        this.logger.error(
          `Stream ${streamId} emitted an error: ${formatErrorWithCause(error)}`,
        );
      },
    });

    return { ...turn, getStreamError: () => lastUnderlyingStreamError };
  }

  private prepareMessages({
    workspace,
    messages,
    modelConfig,
    browsingContext,
    workspaceMemberId,
    timezone,
  }: {
    workspace: WorkspaceEntity;
    messages: ExtendedUIMessage[];
    modelConfig: AiModelConfig;
    browsingContext: BrowsingContextType | null;
    workspaceMemberId: string;
    timezone: string | null;
  }): {
    preparedMessages: ExtendedUIMessage[];
    codeInterpreterFiles: UploadedFileReference[];
  } {
    const isCodeInterpreterEnabled = this.codeInterpreterService.isEnabled();

    let processedMessages = replaceUnsupportedFileParts(
      messages,
      modelConfig.modalities,
      isCodeInterpreterEnabled,
    );
    let codeInterpreterFiles: UploadedFileReference[] = [];

    if (isCodeInterpreterEnabled) {
      const extracted = extractCodeInterpreterFiles(processedMessages);

      processedMessages = extracted.processedMessages;
      codeInterpreterFiles = extracted.extractedFiles.map(
        ({ filename, fileId }) => ({ filename, fileId }),
      );
    }

    if (isDefined(browsingContext)) {
      processedMessages = this.injectBrowsingContextIntoLastUserMessage(
        processedMessages,
        this.buildContextFromBrowsingContext(workspace, browsingContext),
      );
    }

    return {
      preparedMessages: injectMessageTimestamps(
        injectChatMessageSenders({
          messages: processedMessages,
          currentWorkspaceMemberId: workspaceMemberId,
        }),
        timezone,
      ),
      codeInterpreterFiles,
    };
  }

  private sanitizeMessagePartsForModel(
    messages: ExtendedUIMessage[],
    directlyCallableToolNames: Set<string>,
  ): ExtendedUIMessage[] {
    return messages.map((message) => ({
      ...message,
      parts: guideUncallableToolCallsToMetaTool(
        finalizeDanglingToolParts(message.parts),
        directlyCallableToolNames,
      ),
    }));
  }

  private injectBrowsingContextIntoLastUserMessage(
    messages: ExtendedUIMessage[],
    contextString: string,
  ): ExtendedUIMessage[] {
    const lastUserIndex = messages
      .map((message) => message.role)
      .lastIndexOf('user');

    if (lastUserIndex === -1) {
      return messages;
    }

    const lastUserMessage = messages[lastUserIndex];
    const browsingContextPart = {
      type: 'text' as const,
      text: `<browsing_context note="Only use this if the user explicitly asks about the current page, record, or view. Do not call any tools based on this context.">\n${contextString}\n</browsing_context>`,
    };

    return [
      ...messages.slice(0, lastUserIndex),
      {
        ...lastUserMessage,
        parts: [...lastUserMessage.parts, browsingContextPart],
      },
      ...messages.slice(lastUserIndex + 1),
    ];
  }

  private buildContextFromBrowsingContext(
    workspace: WorkspaceEntity,
    browsingContext: BrowsingContextType,
  ): string {
    switch (browsingContext.type) {
      case 'recordPage':
        return this.buildRecordPageContext(
          workspace,
          browsingContext.objectNameSingular,
          browsingContext.recordId,
          browsingContext.pageLayoutId,
          browsingContext.activeTabId,
        );
      case 'listView':
        return this.buildListViewContext(browsingContext);
      case 'settingsPage':
        return this.buildSettingsPageContext(workspace, browsingContext.path);
      default:
        // browsing context comes from unvalidated client JSON
        return '';
    }
  }

  private buildRecordPageContext(
    workspace: WorkspaceEntity,
    objectNameSingular: string,
    recordId: string,
    pageLayoutId?: string,
    activeTabId?: string | null,
  ): string {
    const resourceUrl = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      }),
    });

    let context = `The user is viewing a ${objectNameSingular} record (ID: ${recordId}, URL: ${resourceUrl}). Use tools to fetch record details if needed.`;

    if (isDefined(pageLayoutId)) {
      context += `\nPage layout ID: ${pageLayoutId}.`;
    }

    if (isDefined(activeTabId)) {
      context += `\nActive tab ID: ${activeTabId}.`;
    }

    return context;
  }

  private buildListViewContext(browsingContext: {
    type: 'listView';
    objectNameSingular: string;
    viewId: string;
    viewName: string;
    filterDescriptions: string[];
  }): string {
    const { objectNameSingular, viewId, viewName, filterDescriptions } =
      browsingContext;

    let context = `The user is viewing a list of ${objectNameSingular} records in a view called "${viewName}" (viewId: ${viewId}).`;

    if (filterDescriptions.length > 0) {
      context += `\nFilters applied: ${filterDescriptions.join(', ')}`;
    }

    context += `\nUse get_view_query_parameters tool with this viewId to get the exact filter/sort parameters for querying records.`;

    return context;
  }

  private buildSettingsPageContext(
    workspace: WorkspaceEntity,
    path: string,
  ): string {
    const resourceUrl = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: path,
    });

    return `The user is on the settings page ${resourceUrl}. When they talk about what this page shows (for example "this rule" or "my rule"), they mean the item at this path.`;
  }
}
