import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WORKSPACE_SETUP_CHAT_THREAD_TITLE } from 'twenty-shared/ai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  WORKSPACE_SETUP_CHAT_THREAD_KEY,
  type WorkspaceSetupChatKeyValueTypeMap,
} from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-chat-key-value.type';
import { buildWorkspaceSetupPromptText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-prompt-text.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const RESOLVE_THREAD_MAX_ATTEMPTS = 3;

type StartWorkspaceSetupChatServiceResult =
  | {
      outcome: WorkspaceSetupChatOutcome.STARTED;
      threadId: string;
      streamId: string;
      turnId: string;
    }
  | { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED; threadId: string }
  | { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE; threadId: null };

@Injectable()
export class WorkspaceSetupChatService {
  private readonly logger = new Logger(WorkspaceSetupChatService.name);

  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingUsageService: BillingUsageService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly keyValuePairService: KeyValuePairService<WorkspaceSetupChatKeyValueTypeMap>,
    private readonly agentChatService: AgentChatService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
  ) {}

  async startWorkspaceSetupChat({
    userId,
    userWorkspaceId,
    workspace,
    companyContext,
  }: {
    userId: string;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    companyContext: WorkspaceCompanyEnrichment | null;
  }): Promise<StartWorkspaceSetupChatServiceResult> {
    if (!this.twentyConfigService.get('IS_ONBOARDING_AI_CHAT_ENABLED')) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, threadId: null };
    }

    const isWorkspaceCreator = await this.isWorkspaceCreator({
      userId,
      workspaceId: workspace.id,
    });

    if (!isWorkspaceCreator) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, threadId: null };
    }

    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, threadId: null };
    }

    try {
      this.aiModelRegistryService.validateModelAvailability(
        workspace.smartModel,
        workspace,
      );
    } catch {
      this.logger.warn(
        `Workspace setup chat unavailable for workspace ${workspace.id}: model ${workspace.smartModel} is not available`,
      );

      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, threadId: null };
    }

    const existingThreadId = await this.resolveExistingThread({
      userId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    const mustCreateThread = !isDefined(existingThreadId);

    if (
      mustCreateThread &&
      !(await this.hasCreditsToStartKickoffStream(workspace.id))
    ) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, threadId: null };
    }

    const threadId =
      existingThreadId ??
      (await this.createThreadWithPointer({
        userId,
        userWorkspaceId,
        workspaceId: workspace.id,
      }));

    return this.ensureKickoffStream({
      threadId,
      userWorkspaceId,
      workspace,
      companyContext,
    });
  }

  private async hasCreditsToStartKickoffStream(
    workspaceId: string,
  ): Promise<boolean> {
    return this.billingUsageService.hasAvailableCredits(workspaceId);
  }

  private async deletePointerToDeletedThread({
    userId,
    workspaceId,
    deletedThreadId,
  }: {
    userId: string;
    workspaceId: string;
    deletedThreadId: string;
  }): Promise<void> {
    await this.keyValuePairService.deleteIfValueEquals({
      userId,
      workspaceId,
      key: WORKSPACE_SETUP_CHAT_THREAD_KEY,
      value: { threadId: deletedThreadId },
      type: KeyValuePairType.USER_VARIABLE,
    });
  }

  private async getUserLocale(userWorkspaceId: string): Promise<string> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId },
    });

    return userWorkspace?.locale ?? SOURCE_LOCALE;
  }

  private async isWorkspaceCreator({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const earliestUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'ASC' },
    });

    return earliestUserWorkspace?.userId === userId;
  }

  private async resolveExistingThread({
    userId,
    userWorkspaceId,
    workspaceId,
  }: {
    userId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string | null> {
    for (let attempt = 0; attempt < RESOLVE_THREAD_MAX_ATTEMPTS; attempt++) {
      const storedThreadId = await this.getStoredThreadId({
        userId,
        workspaceId,
      });

      if (!isDefined(storedThreadId)) {
        return null;
      }

      const storedThread = await this.agentChatService.findThreadById({
        threadId: storedThreadId,
        userWorkspaceId,
        workspaceId,
      });

      if (isDefined(storedThread)) {
        return storedThreadId;
      }

      await this.deletePointerToDeletedThread({
        userId,
        workspaceId,
        deletedThreadId: storedThreadId,
      });
    }

    throw new AiException(
      'Could not resolve a workspace setup thread',
      AiExceptionCode.THREAD_NOT_FOUND,
    );
  }

  private async createThreadWithPointer({
    userId,
    userWorkspaceId,
    workspaceId,
  }: {
    userId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string> {
    const newThreadId = v4();

    await this.agentChatService.createThread({
      userWorkspaceId,
      workspaceId,
      id: newThreadId,
      title: WORKSPACE_SETUP_CHAT_THREAD_TITLE,
    });

    await this.keyValuePairService.trySetIfAbsent({
      userId,
      workspaceId,
      key: WORKSPACE_SETUP_CHAT_THREAD_KEY,
      value: { threadId: newThreadId },
      type: KeyValuePairType.USER_VARIABLE,
    });

    const winningThreadId = await this.getStoredThreadId({
      userId,
      workspaceId,
    });

    if (winningThreadId === newThreadId) {
      return newThreadId;
    }

    await this.agentChatService
      .hardDeleteThread({
        threadId: newThreadId,
        userWorkspaceId,
        workspaceId,
      })
      .catch((error) => {
        this.logger.warn(
          `Failed to delete losing workspace setup thread ${newThreadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

    if (!isDefined(winningThreadId)) {
      throw new AiException(
        'Could not resolve a workspace setup thread',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }

    return winningThreadId;
  }

  private async getStoredThreadId({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const keyValuePairs = await this.keyValuePairService.get({
      userId,
      workspaceId,
      key: WORKSPACE_SETUP_CHAT_THREAD_KEY,
      type: KeyValuePairType.USER_VARIABLE,
    });

    const storedValue = (
      keyValuePairs[0] as
        | {
            value?: WorkspaceSetupChatKeyValueTypeMap[typeof WORKSPACE_SETUP_CHAT_THREAD_KEY];
          }
        | undefined
    )?.value;

    return isDefined(storedValue?.threadId) ? storedValue.threadId : null;
  }

  private async ensureKickoffStream({
    threadId,
    userWorkspaceId,
    workspace,
    companyContext,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    companyContext: WorkspaceCompanyEnrichment | null;
  }): Promise<StartWorkspaceSetupChatServiceResult> {
    const thread = await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    if (isDefined(thread.deletedAt)) {
      await this.agentChatService.unarchiveThread({
        threadId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });
    }

    if (isDefined(thread.activeStreamId)) {
      const interruptedError =
        await this.agentChatStreamingService.reapDeadStream({
          thread,
          workspaceId: workspace.id,
        });

      if (!isDefined(interruptedError)) {
        return { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED, threadId };
      }
    }

    const hasConversationMessages =
      await this.agentChatService.hasConversationMessages({
        threadId,
        workspaceId: workspace.id,
      });

    if (hasConversationMessages) {
      return { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED, threadId };
    }

    if (!(await this.hasCreditsToStartKickoffStream(workspace.id))) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, threadId: null };
    }

    const kickoffResult =
      await this.agentChatStreamingService.startHiddenKickoffStream({
        threadId,
        userWorkspaceId,
        workspace,
        text: buildWorkspaceSetupPromptText({
          companyEnrichment: companyContext,
          locale: await this.getUserLocale(userWorkspaceId),
        }),
      });

    if (!isDefined(kickoffResult)) {
      return { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED, threadId };
    }

    return {
      outcome: WorkspaceSetupChatOutcome.STARTED,
      threadId,
      streamId: kickoffResult.streamId,
      turnId: kickoffResult.turnId,
    };
  }
}
