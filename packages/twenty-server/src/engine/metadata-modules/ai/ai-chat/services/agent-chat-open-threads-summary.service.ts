import { Injectable } from '@nestjs/common';

import { type AgentChatOpenThreadsSummaryDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-open-threads-summary.dto';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { buildAgentChatOpenThreadsSummaryQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-open-threads-summary-query.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const EMPTY_OPEN_THREADS_SUMMARY: AgentChatOpenThreadsSummaryDTO = {
  openThreadCount: 0,
  unreadOpenThreadCount: 0,
  needsInputThreadCount: 0,
  mentionThreadCount: 0,
  assignedToMeThreadCount: 0,
  assignedThreadCount: 0,
  unassignedThreadCount: 0,
  hasUnreadOpenThread: false,
  hasUnreadMentionThread: false,
  hasUnreadAssignedThread: false,
};

@Injectable()
export class AgentChatOpenThreadsSummaryService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  // Over the chats the member can open and follows, the way the inbox lists
  // them
  async findOpenThreadsSummary({
    workspaceId,
    workspaceMemberId,
  }: Omit<
    AgentChatThreadAccessArgs,
    'threadId'
  >): Promise<AgentChatOpenThreadsSummaryDTO> {
    await this.sharingService.assertHasMentionResolutionOrThrow(workspaceId);

    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });

    const [summary] = await this.workspaceOrmManager
      .executeInWorkspaceContext(() => {
        const repository =
          this.workspaceOrmManager.getRepositoryWithContextPermissions(
            'agentChatThread',
          );
        const readableThreads = repository
          .createQueryBuilder('thread')
          .select([])
          .addSelect('"thread"."id"', 'id')
          .addSelect('"thread"."lastActivityAt"', 'lastActivityAt')
          .addSelect('"thread"."assigneeId"', 'assigneeId')
          .addSelect(
            '"thread"."pendingQuestionMessageId"',
            'pendingQuestionMessageId',
          )
          .applyRowLevelPermissions();

        return repository.executeRaw<
          Pick<
            AgentChatOpenThreadsSummaryDTO,
            keyof AgentChatOpenThreadsSummaryDTO
          >
        >(
          buildAgentChatOpenThreadsSummaryQuery({
            workspaceId,
            readableThreadsQuery: readableThreads.getQuery(),
          }),
          {
            ...readableThreads.getParameters(),
            summaryWorkspaceMemberId: workspaceMemberId,
          },
        );
      }, authContext)
      .catch((error: unknown) => {
        // A role that cannot read chats has none open
        if (
          error instanceof PermissionsException &&
          error.code === PermissionsExceptionCode.PERMISSION_DENIED
        ) {
          return [EMPTY_OPEN_THREADS_SUMMARY];
        }

        throw error;
      });

    return summary;
  }
}
