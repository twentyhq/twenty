import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';
import { QueryFailedError } from 'typeorm';
import { v5 } from 'uuid';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { buildWorkspaceSetupPromptText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-prompt-text.util';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

const WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE =
  '1e9195f3-c26a-4bfc-961e-dc317b4badbd';

const WORKSPACE_SETUP_CHAT_THREAD_TITLE = msg`Workspace setup`;

type StartWorkspaceSetupChatServiceResult =
  | {
      outcome:
        | WorkspaceSetupChatOutcome.STARTED
        | WorkspaceSetupChatOutcome.ALREADY_STARTED;
      thread: AgentChatThreadEntity;
    }
  | {
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE;
      thread: null;
    };

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class WorkspaceSetupChatService {
  private readonly logger = new Logger(WorkspaceSetupChatService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingUsageService: BillingUsageService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly i18nService: I18nService,
    private readonly agentChatService: AgentChatService,
    private readonly agentChatStreamingService: AgentChatStreamingService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async startWorkspaceSetupChat({
    userId,
    userLocale,
    userWorkspaceId,
    workspace,
    companyContext,
  }: {
    userId: string;
    userLocale: string | null;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
    companyContext: WorkspaceCompanyEnrichment | null;
  }): Promise<StartWorkspaceSetupChatServiceResult> {
    if (!this.twentyConfigService.get('IS_ONBOARDING_AI_CHAT_ENABLED')) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, thread: null };
    }

    const isWorkspaceCreator =
      await this.userWorkspaceService.isWorkspaceCreator({
        userId,
        workspaceId: workspace.id,
      });

    if (!isWorkspaceCreator) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, thread: null };
    }

    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, thread: null };
    }

    const localePromise = this.resolveUserLocale({
      userId,
      userLocale,
      workspaceId: workspace.id,
    });

    const threadId = v5(
      `${workspace.id}:${userWorkspaceId}`,
      WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
    );

    let thread = await this.agentChatService.findThreadById({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    if (isDefined(thread)) {
      if (isDefined(thread.deletedAt)) {
        thread = await this.agentChatService.unarchiveThread({
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
          return {
            outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
            thread,
          };
        }
      }

      const hasConversationMessages =
        await this.agentChatService.hasConversationMessages({
          threadId,
          workspaceId: workspace.id,
        });

      if (hasConversationMessages) {
        return { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED, thread };
      }
    }

    const hasAvailableCredits =
      await this.billingUsageService.hasAvailableCredits(workspace.id);

    if (!hasAvailableCredits) {
      return { outcome: WorkspaceSetupChatOutcome.UNAVAILABLE, thread: null };
    }

    const locale = await localePromise;

    thread ??= await this.createThreadWithDeterministicId({
      threadId,
      userWorkspaceId,
      workspaceId: workspace.id,
      locale,
    });

    const kickoffResult =
      await this.agentChatStreamingService.startHiddenKickoffStream({
        thread,
        userWorkspaceId,
        workspace,
        text: buildWorkspaceSetupPromptText({
          companyEnrichment: companyContext,
          locale,
        }),
        modelId: workspace.fastModel,
      });

    if (!isDefined(kickoffResult)) {
      return { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED, thread };
    }

    tagAiChatStreamScope({
      streamId: kickoffResult.streamId,
      turnId: kickoffResult.turnId,
      threadId,
      workspaceId: workspace.id,
    });

    return { outcome: WorkspaceSetupChatOutcome.STARTED, thread };
  }

  private async createThreadWithDeterministicId({
    threadId,
    userWorkspaceId,
    workspaceId,
    locale,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
    locale: string;
  }): Promise<AgentChatThreadEntity> {
    const safeLocale = (locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE;
    const title = this.i18nService
      .getI18nInstance(safeLocale)
      ._(WORKSPACE_SETUP_CHAT_THREAD_TITLE);

    try {
      return await this.agentChatService.createThread({
        userWorkspaceId,
        workspaceId,
        id: threadId,
        title,
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const concurrentlyCreatedThread =
          await this.agentChatService.findThreadById({
            threadId,
            userWorkspaceId,
            workspaceId,
          });

        if (isDefined(concurrentlyCreatedThread)) {
          return concurrentlyCreatedThread;
        }
      }

      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code ===
        POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION
    );
  }

  private async resolveUserLocale({
    userId,
    userLocale,
    workspaceId,
  }: {
    userId: string;
    userLocale: string | null;
    workspaceId: string;
  }): Promise<string> {
    // The workspace member locale is what the UI is translated with, while the user
    // one stays at its signup default, so the assistant must follow the member locale.
    const workspaceMemberLocale = await this.findWorkspaceMemberLocale({
      userId,
      workspaceId,
    });

    return workspaceMemberLocale ?? userLocale ?? SOURCE_LOCALE;
  }

  private async findWorkspaceMemberLocale({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<string | null> {
    try {
      const workspaceMember =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const workspaceMemberRepository =
              await this.globalWorkspaceOrmManager.getRepository(
                workspaceId,
                'workspaceMember',
                { shouldBypassPermissionChecks: true },
              );

            return workspaceMemberRepository.findOne({ where: { userId } });
          },
          buildSystemAuthContext(workspaceId),
        );

      return workspaceMember?.locale ?? null;
    } catch (error) {
      this.logger.warn(
        `Failed to read the workspace member locale for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }
}
