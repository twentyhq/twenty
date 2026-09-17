import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, QueryFailedError, Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatChannelMemberEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel-member.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatChannelMemberRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-member-role.enum';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { buildChannelAccessWhere } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-channel-access-where.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ChannelInput = {
  name?: string;
  visibility?: AgentChatChannelVisibility;
  targetObjectMetadataId?: string | null;
  targetRecordId?: string | null;
};

type ChannelActor = {
  userWorkspaceId: string;
  workspaceId: string;
};

type ChannelThreadWithRecipients = {
  thread: AgentChatThreadEntity;
  participantUserWorkspaceIds: string[];
  recipients: string[] | undefined;
};

const serializeChannelForBroadcast = (channel: AgentChatChannelEntity) => ({
  id: channel.id,
  name: channel.name,
  visibility: channel.visibility,
  targetObjectMetadataId: channel.targetObjectMetadataId,
  targetRecordId: channel.targetRecordId,
  createdByUserWorkspaceId: channel.createdByUserWorkspaceId,
  createdAt: channel.createdAt,
  updatedAt: channel.updatedAt,
});

const serializeMemberForBroadcast = (member: AgentChatChannelMemberEntity) => ({
  id: member.id,
  channelId: member.channelId,
  userWorkspaceId: member.userWorkspaceId,
  role: member.role,
  createdAt: member.createdAt,
});

@Injectable()
export class AgentChatChannelService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
    @InjectWorkspaceScopedRepository(AgentChatChannelMemberEntity)
    private readonly memberRepository: WorkspaceScopedRepository<AgentChatChannelMemberEntity>,
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async getChannelsForUser({
    userWorkspaceId,
    workspaceId,
  }: ChannelActor): Promise<AgentChatChannelEntity[]> {
    return this.channelRepository.find(workspaceId, {
      where: buildChannelAccessWhere({ userWorkspaceId }),
      order: { name: 'ASC' },
    });
  }

  // Members of every channel the user can see, so the client can tell which
  // channels it belongs to and who else is in them.
  async getChannelMembersForUser({
    userWorkspaceId,
    workspaceId,
  }: ChannelActor): Promise<AgentChatChannelMemberEntity[]> {
    return this.memberRepository
      .createQueryBuilder('member')
      .innerJoin('member.channel', 'channel')
      .leftJoin(
        'channel.members',
        'viewer',
        'viewer.userWorkspaceId = :userWorkspaceId',
        { userWorkspaceId },
      )
      .where('member.workspaceId = :workspaceId', { workspaceId })
      .andWhere(
        '(channel.visibility = :publicVisibility OR viewer.id IS NOT NULL)',
        { publicVisibility: AgentChatChannelVisibility.PUBLIC },
      )
      .orderBy('member.createdAt', 'ASC')
      .getMany();
  }

  async getAccessibleChannelById({
    channelId,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & { channelId: string }): Promise<AgentChatChannelEntity> {
    const channel = await this.channelRepository.findOne(workspaceId, {
      where: buildChannelAccessWhere({ id: channelId, userWorkspaceId }),
    });

    if (!isDefined(channel)) {
      throw new AiException(
        'Channel not found',
        AiExceptionCode.CHANNEL_NOT_FOUND,
      );
    }

    return channel;
  }

  async createChannel({
    input,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & { input: ChannelInput }): Promise<AgentChatChannelEntity> {
    const name = this.normalizeChannelName(input.name);

    // A channel without an admin cannot be managed, so the channel and its
    // first admin are written in one transaction.
    const { channel, adminMember } =
      await this.userWorkspaceRepository.manager.transaction(
        async (entityManager) => {
          const createdChannel = await this.insertChannelOrThrow(
            workspaceId,
            {
              name,
              visibility: input.visibility ?? AgentChatChannelVisibility.PUBLIC,
              targetObjectMetadataId: input.targetObjectMetadataId ?? null,
              targetRecordId: input.targetRecordId ?? null,
              createdByUserWorkspaceId: userWorkspaceId,
            },
            entityManager,
          );

          const createdAdminMember = await this.memberRepository
            .withManager(entityManager)
            .insertAndReturnOne(workspaceId, {
              channelId: createdChannel.id,
              userWorkspaceId,
              role: AgentChatChannelMemberRole.ADMIN,
            });

          return { channel: createdChannel, adminMember: createdAdminMember };
        },
      );

    const recipients = this.getChannelRecipients(channel, [userWorkspaceId]);

    await this.broadcastChannel('created', channel, recipients);
    await this.broadcastMember('created', adminMember, recipients);

    return channel;
  }

  async updateChannel({
    channelId,
    input,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & {
    channelId: string;
    input: ChannelInput;
  }): Promise<AgentChatChannelEntity> {
    const channel = await this.getAccessibleChannelById({
      channelId,
      userWorkspaceId,
      workspaceId,
    });

    await this.assertChannelAdmin({ channelId, userWorkspaceId, workspaceId });

    const memberIdsBefore = await this.getMemberUserWorkspaceIds(
      channelId,
      workspaceId,
    );
    const recipientsBefore = this.getChannelRecipients(
      channel,
      memberIdsBefore,
    );

    const updates: Pick<
      Partial<AgentChatChannelEntity>,
      'name' | 'visibility'
    > = {
      ...(isDefined(input.name)
        ? { name: this.normalizeChannelName(input.name) }
        : {}),
      ...(isDefined(input.visibility) ? { visibility: input.visibility } : {}),
    };

    if (Object.keys(updates).length === 0) {
      return channel;
    }

    const isVisibilityChanging =
      isDefined(updates.visibility) &&
      updates.visibility !== channel.visibility;

    // Thread readers depend on the visibility, so their pre-change sets are
    // captured while the old visibility is still what the database says.
    const threadRecipientsBefore = isVisibilityChanging
      ? new Map(
          (
            await this.getChannelThreadsWithRecipients(channelId, workspaceId)
          ).map(({ thread, recipients }) => [thread.id, recipients]),
        )
      : undefined;

    await this.updateChannelOrThrow(
      workspaceId,
      channelId,
      updates as QueryDeepPartialEntity<AgentChatChannelEntity>,
    );

    const updatedChannel = { ...channel, ...updates, updatedAt: new Date() };
    const recipientsAfter = this.getChannelRecipients(
      updatedChannel,
      memberIdsBefore,
    );

    await this.broadcastChannelAccessChange({
      channel: updatedChannel,
      recipientsBefore,
      recipientsAfter,
      updatedFields: Object.keys(updates),
    });

    if (isVisibilityChanging) {
      await this.broadcastChannelThreadsAccessChange({
        channelId,
        workspaceId,
        recipientsBeforeByThreadId: threadRecipientsBefore,
      });
    }

    return updatedChannel;
  }

  async deleteChannel({
    channelId,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & { channelId: string }): Promise<boolean> {
    const channel = await this.getAccessibleChannelById({
      channelId,
      userWorkspaceId,
      workspaceId,
    });

    await this.assertChannelAdmin({ channelId, userWorkspaceId, workspaceId });

    const recipientsBefore = this.getChannelRecipients(
      channel,
      await this.getMemberUserWorkspaceIds(channelId, workspaceId),
    );
    const threadsBefore = await this.getChannelThreadsWithRecipients(
      channelId,
      workspaceId,
    );

    const result = await this.channelRepository.delete(workspaceId, {
      id: channelId,
    });

    if ((result.affected ?? 0) === 0) {
      return false;
    }

    await this.broadcastChannel('deleted', channel, recipientsBefore);

    // Threads fall back to private (the FK nulls channelId), so only their
    // participants keep them and readers who came through the channel lose them.
    for (const {
      thread,
      recipients,
      participantUserWorkspaceIds,
    } of threadsBefore) {
      await this.agentChatService.broadcastThreadAccessChange({
        thread: { ...thread, channelId: null },
        recipientsBefore: recipients,
        recipientsAfter: participantUserWorkspaceIds,
        updatedFields: ['channelId'],
      });
    }

    return true;
  }

  async joinChannel({
    channelId,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & {
    channelId: string;
  }): Promise<AgentChatChannelMemberEntity> {
    const channel = await this.getAccessibleChannelById({
      channelId,
      userWorkspaceId,
      workspaceId,
    });

    if (channel.visibility !== AgentChatChannelVisibility.PUBLIC) {
      throw new AiException(
        'Only public channels can be joined',
        AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
      );
    }

    return this.insertMember({
      channel,
      userWorkspaceId,
      role: AgentChatChannelMemberRole.MEMBER,
      workspaceId,
    });
  }

  async addMember({
    channelId,
    userWorkspaceId,
    actorUserWorkspaceId,
    workspaceId,
  }: {
    channelId: string;
    userWorkspaceId: string;
    actorUserWorkspaceId: string;
    workspaceId: string;
  }): Promise<AgentChatChannelMemberEntity> {
    const channel = await this.getAccessibleChannelById({
      channelId,
      userWorkspaceId: actorUserWorkspaceId,
      workspaceId,
    });

    await this.assertChannelAdmin({
      channelId,
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

    return this.insertMember({
      channel,
      userWorkspaceId,
      role: AgentChatChannelMemberRole.MEMBER,
      workspaceId,
    });
  }

  async leaveChannel({
    channelId,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & { channelId: string }): Promise<boolean> {
    return this.removeMember({
      channelId,
      userWorkspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      workspaceId,
    });
  }

  async removeMember({
    channelId,
    userWorkspaceId,
    actorUserWorkspaceId,
    workspaceId,
  }: {
    channelId: string;
    userWorkspaceId: string;
    actorUserWorkspaceId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const channel = await this.getAccessibleChannelById({
      channelId,
      userWorkspaceId: actorUserWorkspaceId,
      workspaceId,
    });

    const isLeaving = actorUserWorkspaceId === userWorkspaceId;

    if (!isLeaving) {
      await this.assertChannelAdmin({
        channelId,
        userWorkspaceId: actorUserWorkspaceId,
        workspaceId,
      });
    }

    const member = await this.memberRepository.findOne(workspaceId, {
      where: { channelId, userWorkspaceId },
    });

    if (!isDefined(member)) {
      throw new AiException(
        'Channel member not found',
        AiExceptionCode.CHANNEL_MEMBER_NOT_FOUND,
      );
    }

    if (member.role === AgentChatChannelMemberRole.ADMIN && !isLeaving) {
      throw new AiException(
        'Channel admins cannot be removed by someone else',
        AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
      );
    }

    const memberIdsBefore = await this.getMemberUserWorkspaceIds(
      channelId,
      workspaceId,
    );
    const recipientsBefore = this.getChannelRecipients(
      channel,
      memberIdsBefore,
    );
    // Captured before the delete so a member joining meanwhile is diffed as a
    // new reader rather than folded into the previous audience.
    const threadRecipientsBefore =
      channel.visibility === AgentChatChannelVisibility.PRIVATE
        ? new Map(
            (
              await this.getChannelThreadsWithRecipients(channelId, workspaceId)
            ).map(({ thread, recipients }) => [thread.id, recipients]),
          )
        : null;

    const wasDeleted = await this.deleteMemberKeepingAnAdmin({
      member,
      workspaceId,
    });

    if (!wasDeleted) {
      return false;
    }

    await this.broadcastMember('deleted', member, recipientsBefore);

    if (isDefined(threadRecipientsBefore)) {
      await this.broadcastChannel('deleted', channel, [userWorkspaceId]);
      await this.broadcastChannelThreadsAccessChange({
        channelId,
        workspaceId,
        recipientsBeforeByThreadId: threadRecipientsBefore,
      });
    }

    return true;
  }

  async setThreadChannel({
    threadId,
    channelId,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & {
    threadId: string;
    channelId: string | null;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.agentChatService.getThreadById({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    await this.agentChatService.assertThreadOwner({
      threadId,
      userWorkspaceId,
      workspaceId,
    });

    if (isDefined(channelId)) {
      await this.getAccessibleChannelById({
        channelId,
        userWorkspaceId,
        workspaceId,
      });
    }

    if (thread.channelId === channelId) {
      return thread;
    }

    const recipientsBefore =
      await this.agentChatService.getThreadRecipientUserWorkspaceIds({
        threadId,
        workspaceId,
      });

    await this.threadRepository.update(
      workspaceId,
      { id: threadId },
      { channelId },
    );

    const updatedThread = { ...thread, channelId };

    const recipientsAfter =
      await this.agentChatService.getThreadRecipientUserWorkspaceIds({
        threadId,
        workspaceId,
      });

    await this.agentChatService.broadcastThreadAccessChange({
      thread: updatedThread,
      recipientsBefore,
      recipientsAfter,
      updatedFields: ['channelId'],
    });

    return updatedThread;
  }

  // Two admins leaving at the same time must not both pass the "another
  // admin remains" check, so the check and the delete run under a per-channel
  // advisory lock inside one transaction.
  private async deleteMemberKeepingAnAdmin({
    member,
    workspaceId,
  }: {
    member: AgentChatChannelMemberEntity;
    workspaceId: string;
  }): Promise<boolean> {
    return this.userWorkspaceRepository.manager.transaction(
      async (entityManager) => {
        await entityManager.query(
          'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
          [`agentChatChannel:${member.channelId}`],
        );

        const memberRepository =
          this.memberRepository.withManager(entityManager);

        if (member.role === AgentChatChannelMemberRole.ADMIN) {
          const otherAdminExists = await memberRepository
            .createQueryBuilder('member')
            .where('member.workspaceId = :workspaceId', { workspaceId })
            .andWhere('member.channelId = :channelId', {
              channelId: member.channelId,
            })
            .andWhere('member.role = :role', {
              role: AgentChatChannelMemberRole.ADMIN,
            })
            .andWhere('member.id != :memberId', { memberId: member.id })
            .getExists();

          if (!otherAdminExists) {
            throw new AiException(
              'The last admin cannot leave a channel; delete it instead',
              AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
            );
          }
        }

        const result = await memberRepository.delete(workspaceId, {
          id: member.id,
        });

        return (result.affected ?? 0) > 0;
      },
    );
  }

  private async insertMember({
    channel,
    userWorkspaceId,
    role,
    workspaceId,
  }: {
    channel: AgentChatChannelEntity;
    userWorkspaceId: string;
    role: AgentChatChannelMemberRole;
    workspaceId: string;
  }): Promise<AgentChatChannelMemberEntity> {
    const existingMember = await this.memberRepository.findOne(workspaceId, {
      where: { channelId: channel.id, userWorkspaceId },
    });

    if (isDefined(existingMember)) {
      return existingMember;
    }

    let member: AgentChatChannelMemberEntity;

    try {
      member = await this.memberRepository.insertAndReturnOne(workspaceId, {
        channelId: channel.id,
        userWorkspaceId,
        role,
      });
    } catch (error) {
      // A concurrent join or invite already created the row.
      if (!this.isUniqueViolation(error)) {
        throw error;
      }

      const concurrentlyInsertedMember = await this.memberRepository.findOne(
        workspaceId,
        { where: { channelId: channel.id, userWorkspaceId } },
      );

      if (!isDefined(concurrentlyInsertedMember)) {
        throw error;
      }

      return concurrentlyInsertedMember;
    }

    const recipients = this.getChannelRecipients(
      channel,
      await this.getMemberUserWorkspaceIds(channel.id, workspaceId),
    );

    if (channel.visibility === AgentChatChannelVisibility.PRIVATE) {
      await this.broadcastChannel('created', channel, [userWorkspaceId]);
    }

    await this.broadcastMember('created', member, recipients);

    if (channel.visibility === AgentChatChannelVisibility.PRIVATE) {
      const threads = await this.getChannelThreadsWithRecipients(
        channel.id,
        workspaceId,
      );

      for (const {
        thread,
        recipients: threadRecipients,
        participantUserWorkspaceIds,
      } of threads) {
        // A new member who already reads the thread as a participant keeps
        // it rather than being told about it a second time.
        const wasAlreadyReader =
          participantUserWorkspaceIds.includes(userWorkspaceId);

        await this.agentChatService.broadcastThreadAccessChange({
          thread,
          recipientsBefore:
            isDefined(threadRecipients) && !wasAlreadyReader
              ? threadRecipients.filter((id) => id !== userWorkspaceId)
              : threadRecipients,
          recipientsAfter: threadRecipients,
          updatedFields: [],
        });
      }
    }

    return member;
  }

  private async broadcastChannelThreadsAccessChange({
    channelId,
    workspaceId,
    recipientsBeforeByThreadId,
  }: {
    channelId: string;
    workspaceId: string;
    recipientsBeforeByThreadId?: Map<string, string[] | undefined>;
  }): Promise<void> {
    const threads = await this.getChannelThreadsWithRecipients(
      channelId,
      workspaceId,
    );

    for (const { thread, recipients, participantUserWorkspaceIds } of threads) {
      await this.agentChatService.broadcastThreadAccessChange({
        thread,
        // A thread that entered the channel after the snapshot was taken was
        // only readable by its participants before.
        recipientsBefore: recipientsBeforeByThreadId?.has(thread.id)
          ? recipientsBeforeByThreadId.get(thread.id)
          : participantUserWorkspaceIds,
        recipientsAfter: recipients,
        updatedFields: [],
      });
    }
  }

  // Readers are resolved for all of a channel's threads in four queries at
  // most, so admin actions do not fan out one lookup per thread.
  private async getChannelThreadsWithRecipients(
    channelId: string,
    workspaceId: string,
  ): Promise<ChannelThreadWithRecipients[]> {
    const [channel, threads] = await Promise.all([
      this.channelRepository.findOne(workspaceId, {
        where: { id: channelId },
        select: ['id', 'visibility'],
      }),
      this.threadRepository.find(workspaceId, { where: { channelId } }),
    ]);

    const isPublic = channel?.visibility === AgentChatChannelVisibility.PUBLIC;

    const [participantUserWorkspaceIdsByThreadId, memberUserWorkspaceIds] =
      await Promise.all([
        this.agentChatService.getParticipantUserWorkspaceIdsByThreadId({
          threadIds: threads.map((thread) => thread.id),
          workspaceId,
        }),
        isPublic ? [] : this.getMemberUserWorkspaceIds(channelId, workspaceId),
      ]);

    return threads.map((thread) => {
      const participantUserWorkspaceIds =
        participantUserWorkspaceIdsByThreadId.get(thread.id) ?? [];

      return {
        thread,
        participantUserWorkspaceIds,
        recipients: isPublic
          ? undefined
          : [
              ...new Set([
                ...participantUserWorkspaceIds,
                ...memberUserWorkspaceIds,
              ]),
            ],
      };
    });
  }

  private async broadcastChannelAccessChange({
    channel,
    recipientsBefore,
    recipientsAfter,
    updatedFields,
  }: {
    channel: AgentChatChannelEntity;
    recipientsBefore: string[] | undefined;
    recipientsAfter: string[] | undefined;
    updatedFields: string[];
  }): Promise<void> {
    if (!isDefined(recipientsAfter)) {
      await this.broadcastChannel('updated', channel, undefined, updatedFields);

      return;
    }

    if (!isDefined(recipientsBefore)) {
      await this.broadcastChannel('deleted', channel, undefined);
      await this.broadcastChannel('created', channel, recipientsAfter);

      return;
    }

    await this.broadcastChannel(
      'updated',
      channel,
      recipientsAfter,
      updatedFields,
    );
  }

  private getChannelRecipients(
    channel: Pick<AgentChatChannelEntity, 'visibility'>,
    memberUserWorkspaceIds: string[],
  ): string[] | undefined {
    return channel.visibility === AgentChatChannelVisibility.PUBLIC
      ? undefined
      : memberUserWorkspaceIds;
  }

  private async getMemberUserWorkspaceIds(
    channelId: string,
    workspaceId: string,
  ): Promise<string[]> {
    const members = await this.memberRepository.find(workspaceId, {
      where: { channelId },
      select: ['userWorkspaceId'],
    });

    return members.map((member) => member.userWorkspaceId);
  }

  private async assertChannelAdmin({
    channelId,
    userWorkspaceId,
    workspaceId,
  }: ChannelActor & { channelId: string }): Promise<void> {
    const isAdmin = await this.memberRepository.existsBy(workspaceId, {
      channelId,
      userWorkspaceId,
      role: AgentChatChannelMemberRole.ADMIN,
    });

    if (!isAdmin) {
      throw new AiException(
        'Only channel admins can do this',
        AiExceptionCode.CHANNEL_ACTION_NOT_ALLOWED,
      );
    }
  }

  private normalizeChannelName(name: string | undefined): string {
    const trimmed = name?.trim() ?? '';

    if (trimmed.length === 0) {
      throw new AiException(
        'Channel name cannot be empty',
        AiExceptionCode.INVALID_CHANNEL_NAME,
      );
    }

    return trimmed;
  }

  private async insertChannelOrThrow(
    workspaceId: string,
    values: QueryDeepPartialEntity<AgentChatChannelEntity>,
    entityManager: EntityManager,
  ): Promise<AgentChatChannelEntity> {
    try {
      return await this.channelRepository
        .withManager(entityManager)
        .insertAndReturnOne(workspaceId, values);
    } catch (error) {
      throw this.mapUniqueViolation(error);
    }
  }

  private async updateChannelOrThrow(
    workspaceId: string,
    channelId: string,
    updates: QueryDeepPartialEntity<AgentChatChannelEntity>,
  ): Promise<void> {
    try {
      await this.channelRepository.update(
        workspaceId,
        { id: channelId },
        updates,
      );
    } catch (error) {
      throw this.mapUniqueViolation(error);
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      error.driverError?.code === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION
    );
  }

  private mapUniqueViolation(error: unknown): unknown {
    if (this.isUniqueViolation(error)) {
      return new AiException(
        'A channel with this name already exists',
        AiExceptionCode.CHANNEL_NAME_ALREADY_EXISTS,
      );
    }

    return error;
  }

  private async broadcastChannel(
    type: 'created' | 'updated' | 'deleted',
    channel: AgentChatChannelEntity,
    recipientUserWorkspaceIds: string[] | undefined,
    updatedFields?: string[],
  ): Promise<void> {
    const serialized = serializeChannelForBroadcast(channel);

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: channel.workspaceId,
      events: [
        {
          type,
          entityName: 'agentChatChannel',
          recordId: channel.id,
          recipientUserWorkspaceIds,
          properties:
            type === 'deleted'
              ? { before: serialized }
              : { after: serialized, updatedFields },
        },
      ],
    });
  }

  private async broadcastMember(
    type: 'created' | 'deleted',
    member: AgentChatChannelMemberEntity,
    recipientUserWorkspaceIds: string[] | undefined,
  ): Promise<void> {
    const serialized = serializeMemberForBroadcast(member);

    await this.workspaceEventBroadcaster.broadcast({
      workspaceId: member.workspaceId,
      events: [
        {
          type,
          entityName: 'agentChatChannelMember',
          recordId: member.id,
          recipientUserWorkspaceIds,
          properties:
            type === 'deleted' ? { before: serialized } : { after: serialized },
        },
      ],
    });
  }
}
