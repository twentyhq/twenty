import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { parseRecordReferences } from 'twenty-shared/ai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatThreadParticipantEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread-participant.entity';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { isUniqueViolation } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation.util';
import { sanitizeModelDisplayName } from 'src/engine/metadata-modules/ai/ai-chat/utils/sanitize-model-display-name.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type AgentChatThreadSharingContext = {
  isShared: boolean;
  channelName: string | null;
  participantNames: string[];
};

@Injectable()
export class AgentChatThreadParticipantService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadParticipantEntity)
    private readonly participantRepository: WorkspaceScopedRepository<AgentChatThreadParticipantEntity>,
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  // A mention is what hands a shared thread to somebody in particular, so the
  // mentioned person joins the conversation and the time is kept: a later
  // mention brings the thread back even after they have cleared it.
  async recordMentionsFromMessage({
    threadId,
    text,
    workspaceId,
  }: {
    threadId: string;
    text: string;
    workspaceId: string;
  }): Promise<string[]> {
    const mentionedWorkspaceMemberIds = [
      ...new Set(
        parseRecordReferences(text)
          .filter(
            (reference) =>
              reference.objectNameSingular ===
              CoreObjectNameSingular.WorkspaceMember,
          )
          .map((reference) => reference.recordId),
      ),
    ];

    if (mentionedWorkspaceMemberIds.length === 0) {
      return [];
    }

    const mentionedUserWorkspaceIds = (
      await Promise.all(
        mentionedWorkspaceMemberIds.map((workspaceMemberId) =>
          this.resolveUserWorkspaceIdForWorkspaceMember({
            workspaceMemberId,
            workspaceId,
          }),
        ),
      )
    ).filter(isDefined);

    if (mentionedUserWorkspaceIds.length === 0) {
      return [];
    }

    const lastMentionedAt = new Date();

    await Promise.all(
      mentionedUserWorkspaceIds.map((userWorkspaceId) =>
        this.upsertMentionedParticipant({
          threadId,
          userWorkspaceId,
          lastMentionedAt,
          workspaceId,
        }),
      ),
    );

    return mentionedUserWorkspaceIds;
  }

  private async resolveUserWorkspaceIdForWorkspaceMember({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(workspaceMember)) {
      return null;
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId,
      });

    return userWorkspace?.id ?? null;
  }

  private async upsertMentionedParticipant({
    threadId,
    userWorkspaceId,
    lastMentionedAt,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    lastMentionedAt: Date;
    workspaceId: string;
  }): Promise<void> {
    const existing = await this.participantRepository.findOne(workspaceId, {
      where: { threadId, userWorkspaceId },
    });

    if (isDefined(existing)) {
      await this.participantRepository.update(
        workspaceId,
        { id: existing.id },
        { lastMentionedAt },
      );

      return;
    }

    try {
      await this.participantRepository.insertAndReturnOne(workspaceId, {
        threadId,
        userWorkspaceId,
        workspaceId,
        role: AgentChatThreadParticipantRole.MEMBER,
        lastMentionedAt,
      });
    } catch (error) {
      // Two mentions of the same person landing together is a race the
      // unique index settles; the row that won already says what this one
      // would have.
      if (!isUniqueViolation(error)) {
        throw error;
      }
    }
  }

  async getParticipantsForThread({
    threadId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadParticipantEntity[]> {
    await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    return this.participantRepository.find(workspaceId, {
      where: { threadId },
      order: { createdAt: 'ASC' },
    });
  }

  async addParticipant({
    threadId,
    actorUserWorkspaceId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    actorUserWorkspaceId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadParticipantEntity> {
    const thread = await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId: actorUserWorkspaceId,
      workspaceId,
    });

    await this.agentChatService.assertThreadOwner({
      threadId,
      userWorkspaceId: actorUserWorkspaceId,
      workspaceId,
    });

    const targetUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
      select: ['id'],
    });

    if (!isDefined(targetUserWorkspace)) {
      throw new AiException(
        'User workspace not found in this workspace',
        AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND,
      );
    }

    const existingParticipant = await this.participantRepository.findOne(
      workspaceId,
      { where: { threadId, userWorkspaceId } },
    );

    if (isDefined(existingParticipant)) {
      return existingParticipant;
    }

    // Captured before the insert: a reader who already sees the thread
    // through its channel must not get it announced a second time.
    const recipientsBefore =
      await this.agentChatService.getThreadRecipientUserWorkspaceIds({
        threadId,
        workspaceId,
      });

    let participant: AgentChatThreadParticipantEntity;

    try {
      participant = await this.participantRepository.insertAndReturnOne(
        workspaceId,
        {
          threadId,
          userWorkspaceId,
          role: AgentChatThreadParticipantRole.MEMBER,
        },
      );
    } catch (error) {
      // A concurrent request already added the same person.
      if (!isUniqueViolation(error)) {
        throw error;
      }

      const concurrentlyAddedParticipant =
        await this.participantRepository.findOne(workspaceId, {
          where: { threadId, userWorkspaceId },
        });

      if (!isDefined(concurrentlyAddedParticipant)) {
        throw error;
      }

      return concurrentlyAddedParticipant;
    }

    const hadAccess =
      !isDefined(recipientsBefore) ||
      recipientsBefore.includes(userWorkspaceId);

    if (!hadAccess) {
      await this.agentChatService.broadcastThreadCreatedToRecipients({
        thread,
        recipientUserWorkspaceIds: [userWorkspaceId],
      });
    }

    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'participants-updated' },
    });

    return participant;
  }

  async removeParticipant({
    threadId,
    actorUserWorkspaceId,
    userWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    actorUserWorkspaceId: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const thread = await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId: actorUserWorkspaceId,
      workspaceId,
    });

    const isLeaving = actorUserWorkspaceId === userWorkspaceId;

    if (!isLeaving) {
      await this.agentChatService.assertThreadOwner({
        threadId,
        userWorkspaceId: actorUserWorkspaceId,
        workspaceId,
      });
    }

    const participant = await this.participantRepository.findOne(workspaceId, {
      where: { threadId, userWorkspaceId },
    });

    if (!isDefined(participant)) {
      throw new AiException(
        'Participant not found',
        AiExceptionCode.THREAD_PARTICIPANT_NOT_FOUND,
      );
    }

    if (participant.role === AgentChatThreadParticipantRole.OWNER) {
      throw new AiException(
        'The owner cannot be removed from a chat thread',
        AiExceptionCode.THREAD_ACTION_NOT_ALLOWED,
      );
    }

    const result = await this.participantRepository.delete(workspaceId, {
      id: participant.id,
    });

    if ((result.affected ?? 0) === 0) {
      return false;
    }

    // The thread's channel may still grant the removed participant access,
    // in which case it must stay in their list.
    const recipientsAfter =
      await this.agentChatService.getThreadRecipientUserWorkspaceIds({
        threadId,
        workspaceId,
      });

    const keepsAccess =
      !isDefined(recipientsAfter) || recipientsAfter.includes(userWorkspaceId);

    if (!keepsAccess) {
      await this.agentChatService.broadcastThreadDeletedToRecipients({
        thread,
        recipientUserWorkspaceIds: [userWorkspaceId],
      });
    }

    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'participants-updated' },
    });

    return true;
  }

  // What the model needs to know about who is in the thread. A thread is
  // shared once a second participant joins or once it lives in a channel.
  async getThreadSharingContext({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadSharingContext> {
    const [thread, participants] = await Promise.all([
      this.threadRepository.findOne(workspaceId, {
        where: { id: threadId },
        relations: ['channel'],
      }),
      this.participantRepository.find(workspaceId, {
        where: { threadId },
        select: ['userWorkspaceId'],
      }),
    ]);

    const channel = thread?.channel ?? null;
    const participantNames = await this.getDisplayNamesByUserWorkspaceIds({
      userWorkspaceIds: participants.map(
        (participant) => participant.userWorkspaceId,
      ),
      workspaceId,
    });

    return {
      isShared: participants.length > 1 || isDefined(channel),
      channelName: isDefined(channel)
        ? sanitizeModelDisplayName(channel.name)
        : null,
      participantNames: [...participantNames.values()],
    };
  }

  // Falls back to the email so a member without a name still reads as a
  // distinct person.
  async getDisplayNamesByUserWorkspaceIds({
    userWorkspaceIds,
    workspaceId,
  }: {
    userWorkspaceIds: string[];
    workspaceId: string;
  }): Promise<Map<string, string>> {
    const uniqueUserWorkspaceIds = [...new Set(userWorkspaceIds)];

    if (uniqueUserWorkspaceIds.length === 0) {
      return new Map();
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { id: In(uniqueUserWorkspaceIds), workspaceId },
      relations: ['user'],
    });

    return new Map(
      userWorkspaces.map((userWorkspace) => {
        const fullName =
          `${userWorkspace.user?.firstName ?? ''} ${userWorkspace.user?.lastName ?? ''}`.trim();

        return [
          userWorkspace.id,
          sanitizeModelDisplayName(
            fullName.length > 0 ? fullName : (userWorkspace.user?.email ?? ''),
          ),
        ];
      }),
    );
  }
}
