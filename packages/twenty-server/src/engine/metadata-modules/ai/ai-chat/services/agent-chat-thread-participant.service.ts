import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatThreadParticipantEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread-participant.entity';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type AgentChatThreadParticipantDisplayName = {
  userWorkspaceId: string;
  displayName: string;
};

@Injectable()
export class AgentChatThreadParticipantService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadParticipantEntity)
    private readonly participantRepository: WorkspaceScopedRepository<AgentChatThreadParticipantEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
  ) {}

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

    await this.assertActorIsOwner({
      threadId,
      actorUserWorkspaceId,
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

    const participant = await this.participantRepository.insertAndReturnOne(
      workspaceId,
      {
        threadId,
        userWorkspaceId,
        role: AgentChatThreadParticipantRole.MEMBER,
      },
    );

    await this.agentChatService.broadcastThreadCreatedToRecipients({
      thread,
      recipientUserWorkspaceIds: [userWorkspaceId],
    });

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
      await this.assertActorIsOwner({
        threadId,
        actorUserWorkspaceId,
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

    await this.agentChatService.broadcastThreadDeletedToRecipients({
      thread,
      recipientUserWorkspaceIds: [userWorkspaceId],
    });

    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event: { type: 'participants-updated' },
    });

    return true;
  }

  // Names the model sees on user messages of a shared thread. Falls back to
  // the email so a member without a name still reads as a distinct person.
  async getParticipantDisplayNames({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<AgentChatThreadParticipantDisplayName[]> {
    const participants = await this.participantRepository.find(workspaceId, {
      where: { threadId },
      select: ['userWorkspaceId'],
    });

    if (participants.length === 0) {
      return [];
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        id: In(participants.map((participant) => participant.userWorkspaceId)),
        workspaceId,
      },
      relations: ['user'],
    });

    return userWorkspaces.map((userWorkspace) => {
      const fullName =
        `${userWorkspace.user?.firstName ?? ''} ${userWorkspace.user?.lastName ?? ''}`.trim();

      return {
        userWorkspaceId: userWorkspace.id,
        displayName:
          fullName.length > 0 ? fullName : (userWorkspace.user?.email ?? ''),
      };
    });
  }

  private async assertActorIsOwner({
    threadId,
    actorUserWorkspaceId,
    workspaceId,
  }: {
    threadId: string;
    actorUserWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const isOwner = await this.participantRepository.existsBy(workspaceId, {
      threadId,
      userWorkspaceId: actorUserWorkspaceId,
      role: AgentChatThreadParticipantRole.OWNER,
    });

    if (!isOwner) {
      throw new AiException(
        'Only the thread owner can manage participants',
        AiExceptionCode.THREAD_ACTION_NOT_ALLOWED,
      );
    }
  }
}
