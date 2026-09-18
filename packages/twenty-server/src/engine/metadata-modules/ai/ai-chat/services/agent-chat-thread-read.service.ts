import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatThreadReadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread-read.entity';
import { buildThreadAccessWhere } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-thread-access-where.util';
import { isUniqueViolation } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Reading is the one thing a reader may do, so the cursor is gated on the read
// predicate rather than the worker one: somebody who can open a public channel
// thread marks it read the same way a member does, and it stays their own row.
@Injectable()
export class AgentChatThreadReadService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadReadEntity)
    private readonly readRepository: WorkspaceScopedRepository<AgentChatThreadReadEntity>,
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(AgentMessageEntity)
    private readonly messageRepository: WorkspaceScopedRepository<AgentMessageEntity>,
  ) {}

  async markThreadRead({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadReadEntity> {
    await this.assertUserWorkspaceReadsThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    const lastMessage = await this.findLastVisibleMessage({
      threadId,
      workspaceId,
    });

    const lastReadAt = new Date();
    const lastReadMessageId = lastMessage?.id ?? null;

    const { affected } = await this.readRepository.update(
      workspaceId,
      { threadId, userWorkspaceId },
      { lastReadAt, lastReadMessageId },
    );

    if ((affected ?? 0) === 0) {
      try {
        await this.readRepository.insert(workspaceId, {
          threadId,
          userWorkspaceId,
          workspaceId,
          lastReadAt,
          lastReadMessageId,
        });
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }

        // Two tabs opening the same thread race to create the cursor; the one
        // that lost still read it, and its time is the later one.
        await this.readRepository.update(
          workspaceId,
          { threadId, userWorkspaceId },
          { lastReadAt, lastReadMessageId },
        );
      }
    }

    return this.readRepository.findOneOrFail(workspaceId, {
      where: { threadId, userWorkspaceId },
    });
  }

  async getReadsForThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadReadEntity[]> {
    await this.assertUserWorkspaceReadsThread({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    return this.readRepository.find(workspaceId, {
      where: { threadId },
      order: { lastReadAt: 'DESC' },
    });
  }

  // One query for a whole list: a thread is unread when its last message
  // landed after the cursor, or when there is no cursor at all and somebody
  // else wrote the last message.
  async getUnreadThreadIds({
    threadIds,
    userWorkspaceId,
    workspaceId,
  }: {
    threadIds: string[];
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string[]> {
    if (threadIds.length === 0) {
      return [];
    }

    // Answering for a thread the caller cannot open would say whether it
    // exists and has been written in, so the list is narrowed to what they
    // can read before anything is counted.
    const readableThreads = await this.threadRepository.find(workspaceId, {
      where: buildThreadAccessWhere({
        id: In(threadIds),
        userWorkspaceId,
      }),
      select: { id: true },
    });

    const readableThreadIds = readableThreads.map((thread) => thread.id);

    if (readableThreadIds.length === 0) {
      return [];
    }

    const reads = await this.readRepository.find(workspaceId, {
      where: { threadId: In(readableThreadIds), userWorkspaceId },
    });

    const lastReadAtByThreadId = new Map(
      reads.map((read) => [read.threadId, read.lastReadAt]),
    );

    // One row per thread rather than every message of every thread: the list
    // only needs each thread's newest timestamp, and a workspace with long
    // conversations would otherwise read all of them into memory to find it.
    const lastMessageRows = await this.messageRepository
      .createQueryBuilder('message')
      .distinctOn(['message.threadId'])
      .select('message.threadId', 'threadId')
      .addSelect('message.createdAt', 'createdAt')
      .where('message.threadId IN (:...threadIds)', {
        threadIds: readableThreadIds,
      })
      .andWhere('message.workspaceId = :workspaceId', { workspaceId })
      .andWhere('message.isHidden = false')
      .orderBy('message.threadId')
      .addOrderBy('message.createdAt', 'DESC')
      .getRawMany<{ threadId: string; createdAt: Date }>();

    const lastMessageAtByThreadId = new Map(
      lastMessageRows.map((row) => [row.threadId, row.createdAt]),
    );

    return readableThreadIds.filter((threadId) => {
      const lastMessageAt = lastMessageAtByThreadId.get(threadId);

      if (!isDefined(lastMessageAt)) {
        return false;
      }

      const lastReadAt = lastReadAtByThreadId.get(threadId);

      return !isDefined(lastReadAt) || lastReadAt < lastMessageAt;
    });
  }

  // The assistant is one per thread, so its cursor lives on the thread rather
  // than in a table keyed by who in the workspace read. Moving it is how the
  // assistant says it took a message in without answering it.
  async markThreadReadByAssistant({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<void> {
    const lastMessage = await this.findLastVisibleMessage({
      threadId,
      workspaceId,
    });

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      {
        assistantLastReadAt: new Date(),
        assistantLastReadMessageId: lastMessage?.id ?? null,
      },
    );
  }

  private async findLastVisibleMessage({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentMessageEntity | null> {
    return this.messageRepository.findOne(workspaceId, {
      where: { threadId, isHidden: false },
      order: { createdAt: 'DESC' },
    });
  }

  private async assertUserWorkspaceReadsThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: buildThreadAccessWhere({ id: threadId, userWorkspaceId }),
    });

    if (!isDefined(thread)) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
  }
}
