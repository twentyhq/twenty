import { Injectable } from '@nestjs/common';

import { type UsageAdmission } from 'src/engine/core-modules/billing/types/usage-admission.type';
import { type MemberCreditsPayer } from 'src/engine/core-modules/usage-limit/types/member-credits-payer.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { findChatTurnMemberCreditsPayer } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-chat-turn-member-credits-payer.util';
import { getSenderApplicationIdFromAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-sender-application-id-from-auth-context.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class AgentChatTurnPreflightService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly threadService: AgentChatThreadService,
    private readonly aiBillingService: AiBillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async assertCanStartChatTurn({
    threadId,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    memberCreditsPayer,
  }: {
    threadId: string;
    modelId?: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
    memberCreditsPayer: MemberCreditsPayer | null;
  }): Promise<
    { thread: AgentChatThreadWorkspaceEntity } & Pick<
      UsageAdmission,
      'isWorkspaceAllowanceAvailable'
    >
  > {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    this.aiModelRegistryService.validateModelAvailability(
      getChatModelId({ requestedModelId: modelId, workspace }),
    );

    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId: workspace.id,
    });

    const { isWorkspaceAllowanceAvailable } =
      await this.aiBillingService.assertAiExecutionAllowed({
        workspaceId: workspace.id,
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        spenders: { userWorkspaceId },
        memberCreditsPayer: memberCreditsPayer ?? undefined,
      });

    return { thread, isWorkspaceAllowanceAvailable };
  }

  // The request does not load the thread's messages, so a creator's setup
  // conversation is pre-flighted as workspace-funded even after setup completed
  async findRequestMemberCreditsPayer({
    threadId,
    workspaceId,
    userWorkspaceId,
    workspaceMemberId,
    isSenderImpersonated,
  }: {
    threadId: string;
    workspaceId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    isSenderImpersonated: boolean;
  }): Promise<MemberCreditsPayer | null> {
    const isWorkspaceSetupThread =
      threadId ===
        buildWorkspaceSetupChatThreadId({ workspaceId, userWorkspaceId }) &&
      (await this.userWorkspaceService.isWorkspaceCreatorUserWorkspace({
        workspaceId,
        userWorkspaceId,
      }));

    return findChatTurnMemberCreditsPayer({
      userWorkspaceId,
      senderWorkspaceMemberId: workspaceMemberId,
      senderApplicationId: getSenderApplicationIdFromAuthContext({
        workspaceId,
        userWorkspaceId,
      }),
      isWorkspaceSetupThread,
      isSenderImpersonated,
    });
  }
}
