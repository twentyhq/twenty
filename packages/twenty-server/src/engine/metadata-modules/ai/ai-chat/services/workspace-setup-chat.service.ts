import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import {
  type WorkspaceCompanyEnrichment,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { AgentChatStreamingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-streaming.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
import { buildWorkspaceSetupKickoffMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-kickoff-message-text.util';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';

const WORKSPACE_SETUP_CHAT_THREAD_TITLE = msg`Workspace setup`;

type StartWorkspaceSetupChatServiceResult =
  | {
      outcome:
        | WorkspaceSetupChatOutcome.STARTED
        | WorkspaceSetupChatOutcome.ALREADY_STARTED;
      thread: AgentChatThreadWorkspaceEntity;
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
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async startWorkspaceSetupChat({
    userId,
    userEmail,
    userLocale,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    companyContext,
    personContext,
  }: {
    userId: string;
    userEmail: string;
    userLocale: string | null;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
    companyContext: WorkspaceCompanyEnrichment | null;
    personContext: WorkspacePersonEnrichment | null;
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

    const threadId = buildWorkspaceSetupChatThreadId({
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    let thread = await this.threadService.findWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId: workspace.id,
    });

    if (isDefined(thread)) {
      if (isDefined(thread.deletedAt)) {
        thread = await this.sharingService.restoreThreadWithAccess({
          threadId,
          workspaceMemberId,
          workspaceId: workspace.id,
        });
      }

      if (isNonEmptyString(thread.activeStreamId)) {
        const interruptedError =
          await this.streamRecoveryService.reapDeadStream({
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

      const hasMessages = await this.agentChatService.hasMessages({
        threadId,
        workspaceId: workspace.id,
      });

      if (hasMessages) {
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
      workspaceMemberId,
      workspaceId: workspace.id,
      locale,
    });

    const openingTurn = await this.agentChatStreamingService.startOpeningTurn({
      thread,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
      context: buildWorkspaceSetupKickoffMessageText({
        companyEnrichment: companyContext,
        personEnrichment: personContext,
        workspaceContext: {
          workspaceDisplayName: workspace.displayName ?? null,
          workspaceSubdomain: workspace.subdomain,
          userEmail,
        },
        locale,
      }),
      modelId: AUTO_SELECT_MODEL_ID_BY_TIER.fast,
    });

    if (!isDefined(openingTurn)) {
      return { outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED, thread };
    }

    tagAiChatStreamScope({
      streamId: openingTurn.streamId,
      turnId: openingTurn.turnId,
      threadId,
      workspaceId: workspace.id,
    });

    return { outcome: WorkspaceSetupChatOutcome.STARTED, thread };
  }

  private async createThreadWithDeterministicId({
    threadId,
    workspaceMemberId,
    workspaceId,
    locale,
  }: {
    threadId: string;
    workspaceMemberId: string;
    workspaceId: string;
    locale: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const safeLocale = (locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE;
    const title = this.i18nService
      .getI18nInstance(safeLocale)
      ._(WORKSPACE_SETUP_CHAT_THREAD_TITLE);

    try {
      return await this.threadService.createThread({
        workspaceMemberId,
        workspaceId,
        id: threadId,
        title,
      });
    } catch (error) {
      if (isUniqueViolationError(error)) {
        const concurrentlyCreatedThread =
          await this.threadService.findWritableThread({
            threadId,
            workspaceMemberId,
            workspaceId,
          });

        if (isDefined(concurrentlyCreatedThread)) {
          return concurrentlyCreatedThread;
        }
      }

      throw error;
    }
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
    // follow the member locale the UI uses; the user locale stays at its signup default
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
        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const workspaceMemberRepository =
            this.workspaceOrmManager.getRepository('workspaceMember', {
              shouldBypassPermissionChecks: true,
            });

          return workspaceMemberRepository.findOne({ where: { userId } });
        }, buildSystemAuthContext(workspaceId));

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
