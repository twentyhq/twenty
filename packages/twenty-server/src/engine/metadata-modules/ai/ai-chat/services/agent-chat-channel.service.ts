import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-record-event.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { type AgentChatChannelAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-access-args.type';
import {
  throwAgentChatChannelManagementForbidden,
  throwAgentChatChannelNotFound,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-errors.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { insertAgentChatChannelMembers } from 'src/engine/metadata-modules/ai/ai-chat/utils/insert-agent-chat-channel-members.util';
import { writeAgentChatChannelGeneralAccess } from 'src/engine/metadata-modules/ai/ai-chat/utils/write-agent-chat-channel-general-access.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatChannelMemberWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel-member.workspace-entity';
import { type AgentChatChannelWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type ChannelChanges = {
  name?: string;
  icon?: string | null;
  color?: string | null;
  visibility?: AgentChatChannelVisibility;
};

const CHANNEL_COLUMNS = `id, name, icon, color, visibility, "createdAt", "updatedAt", "deletedAt"`;
const MEMBER_COLUMNS = `id, "channelId", "workspaceMemberId", position, "createdAt", "updatedAt", "deletedAt"`;

// Channels are written in SQL so each membership and its grant land
// together: a member reads and replies in a private channel through the
// READ_WRITE grant their membership carries, everyone does in a public one
// through its general access, and its creator manages it through an owner
// grant.
@Injectable()
export class AgentChatChannelService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly channelRecordEventService: AgentChatChannelRecordEventService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async createChannel({
    workspaceId,
    workspaceMemberId,
    name,
    icon,
    color,
    visibility,
    memberIds,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
    name: string;
    icon: string | null;
    color: string | null;
    visibility: AgentChatChannelVisibility;
    memberIds: string[];
  }): Promise<AgentChatChannelWorkspaceEntity> {
    await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });

    const { channelObjectMetadataId } =
      await this.channelAccessService.findChannelObjectMetadataIds(workspaceId);
    const { channelTable, recordShareTable } =
      getAgentChatChannelTables(workspaceId);

    const { channel, members } = await this.threadRepository.query(
      workspaceId,
      async ({ manager }) => {
        const [channel] = await manager.query<
          AgentChatChannelWorkspaceEntity[]
        >(
          `WITH channel AS (
             INSERT INTO ${channelTable} (id, name, icon, color, visibility)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${CHANNEL_COLUMNS}
           ), owner_grant AS (
             INSERT INTO ${recordShareTable}
               ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
             SELECT $6::uuid, channel.id, $7::uuid, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', channel.id
             FROM channel
             ON CONFLICT DO NOTHING
           )
           SELECT * FROM channel`,
          [
            randomUUID(),
            this.validateName(name),
            icon,
            color,
            visibility,
            channelObjectMetadataId,
            workspaceMemberId,
          ],
        );

        await writeAgentChatChannelGeneralAccess({
          manager,
          workspaceId,
          channelId: channel.id,
          visibility,
          channelObjectMetadataId,
        });

        const members = await insertAgentChatChannelMembers({
          manager,
          workspaceId,
          channelId: channel.id,
          memberIds: [workspaceMemberId, ...memberIds],
          channelObjectMetadataId,
        });

        return { channel, members };
      },
    );

    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannel',
      action: DatabaseEventAction.CREATED,
      recordsAfter: [channel],
    });
    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.CREATED,
      recordsAfter: members,
    });

    return channel;
  }

  // Members rename a channel and change its icon; only who manages it
  // changes who can join it. The channel stays locked from reading its
  // visibility to writing the grant that follows it, so concurrent changes
  // cannot leave the grant and the visibility apart
  async updateChannel({
    changes,
    ...args
  }: AgentChatChannelAccessArgs & {
    changes: ChannelChanges;
  }): Promise<AgentChatChannelWorkspaceEntity> {
    await this.channelAccessService.assertMemberOrManager(args);

    const canManage = await this.channelAccessService.canManageChannel(args);
    const { channelObjectMetadataId } =
      await this.channelAccessService.findChannelObjectMetadataIds(
        args.workspaceId,
      );
    const { channelTable } = getAgentChatChannelTables(args.workspaceId);

    const { before, after } = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager }) => {
        const [before] = await manager.query<AgentChatChannelWorkspaceEntity[]>(
          `SELECT ${CHANNEL_COLUMNS} FROM ${channelTable}
           WHERE id = $1 AND "deletedAt" IS NULL
           FOR UPDATE`,
          [args.channelId],
        );

        if (!isDefined(before)) {
          return throwAgentChatChannelNotFound();
        }

        const isVisibilityChanged =
          isDefined(changes.visibility) &&
          changes.visibility !== before.visibility;

        if (isVisibilityChanged && !canManage) {
          throwAgentChatChannelManagementForbidden();
        }

        const assignments: string[] = [];
        const parameters: (string | null)[] = [args.channelId];

        const assign = (column: string, value: string | null) => {
          parameters.push(value);
          assignments.push(`${column} = $${parameters.length}`);
        };

        if (isDefined(changes.name)) {
          assign('name', this.validateName(changes.name));
        }
        if (changes.icon !== undefined) {
          assign('icon', changes.icon);
        }
        if (changes.color !== undefined) {
          assign('color', changes.color);
        }
        if (isVisibilityChanged && isDefined(changes.visibility)) {
          assign('visibility', changes.visibility);
        }

        if (assignments.length === 0) {
          return { before, after: before };
        }

        const [after] = await manager.query<AgentChatChannelWorkspaceEntity[]>(
          `WITH updated_channel AS (
             UPDATE ${channelTable}
             SET ${assignments.join(', ')}, "updatedAt" = now()
             WHERE id = $1
             RETURNING ${CHANNEL_COLUMNS}
           )
           SELECT * FROM updated_channel`,
          parameters,
        );

        if (isVisibilityChanged) {
          await writeAgentChatChannelGeneralAccess({
            manager,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
            visibility: after.visibility,
            channelObjectMetadataId,
          });
        }

        return { before, after };
      },
    );

    if (after !== before) {
      await this.channelRecordEventService.emit({
        workspaceId: args.workspaceId,
        objectName: 'agentChatChannel',
        action: DatabaseEventAction.UPDATED,
        recordsBefore: [before],
        recordsAfter: [after],
      });
    }

    return after;
  }

  // A channel's chats would read through nothing once it is gone, so they
  // move to another channel first
  async deleteChannel({
    destinationChannelId,
    ...args
  }: AgentChatChannelAccessArgs & {
    destinationChannelId: string | null;
  }): Promise<void> {
    await this.channelAccessService.assertCanManageChannel(args);

    const channel = await this.findChannelOrThrow(args);

    if (isDefined(destinationChannelId)) {
      if (destinationChannelId === args.channelId) {
        throw new AiException(
          'A channel cannot move its chats to itself',
          AiExceptionCode.INVALID_CHAT_CHANNEL_DESTINATION,
        );
      }

      await this.channelAccessService.assertChannelAccess({
        ...args,
        channelId: destinationChannelId,
        operationType: 'update',
      });
    }

    const { channelTable, memberTable, recordShareTable } =
      getAgentChatChannelTables(args.workspaceId);

    const { members, movedThreads } = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        // Taken first so a chat moved into the channel meanwhile is seen
        await manager.query(
          `SELECT id FROM ${channelTable} WHERE id = $1 FOR UPDATE`,
          [args.channelId],
        );

        // Chats keep their status in the channel they join
        const threadsBefore = isDefined(destinationChannelId)
          ? await manager.query<AgentChatThreadWorkspaceEntity[]>(
              `SELECT * FROM ${table('agentChatThread')}
               WHERE "channelId" = $1 FOR UPDATE`,
              [args.channelId],
            )
          : [];
        const threadsAfter = isDefined(destinationChannelId)
          ? await manager.query<AgentChatThreadWorkspaceEntity[]>(
              `WITH moved_thread AS (
                 UPDATE ${table('agentChatThread')}
                 SET "channelId" = $2, "updatedAt" = now()
                 WHERE "channelId" = $1
                 RETURNING *
               )
               SELECT * FROM moved_thread`,
              [args.channelId, destinationChannelId],
            )
          : [];
        const threadBeforeById = new Map(
          threadsBefore.map((thread) => [thread.id, thread]),
        );
        const movedThreads = threadsAfter.flatMap((after) => {
          const before = threadBeforeById.get(after.id);

          return isDefined(before) ? [{ before, after }] : [];
        });

        const [{ remainingThreadCount }] = await manager.query<
          { remainingThreadCount: number }[]
        >(
          `SELECT count(*)::int AS "remainingThreadCount"
           FROM ${table('agentChatThread')} WHERE "channelId" = $1`,
          [args.channelId],
        );

        if (remainingThreadCount > 0) {
          throw new AiException(
            'The channel still has chats',
            AiExceptionCode.CHAT_CHANNEL_NOT_EMPTY,
          );
        }

        const members = await manager.query<
          AgentChatChannelMemberWorkspaceEntity[]
        >(
          `WITH deleted_member AS (
             DELETE FROM ${memberTable} WHERE "channelId" = $1
             RETURNING ${MEMBER_COLUMNS}
           )
           SELECT * FROM deleted_member`,
          [args.channelId],
        );

        await manager.query(
          `DELETE FROM ${recordShareTable}
           WHERE "recordId" = $1 OR "sourceId" = ANY($2::uuid[])`,
          [args.channelId, members.map(({ id }) => id)],
        );
        await manager.query(`DELETE FROM ${channelTable} WHERE id = $1`, [
          args.channelId,
        ]);

        return { members, movedThreads };
      },
    );

    await this.threadRecordEventService.emitThreadsUpdated({
      workspaceId: args.workspaceId,
      threads: movedThreads,
    });

    await this.channelRecordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.DESTROYED,
      recordsBefore: members,
    });
    await this.channelRecordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatChannel',
      action: DatabaseEventAction.DESTROYED,
      recordsBefore: [channel],
    });
  }

  async joinChannel(args: AgentChatChannelAccessArgs): Promise<void> {
    await this.channelAccessService.assertChannelAccess({
      ...args,
      operationType: 'select',
    });

    const channel = await this.findChannelOrThrow(args);

    // A private channel is only joined by being added to it
    if (channel.visibility !== AgentChatChannelVisibility.PUBLIC) {
      return throwAgentChatChannelNotFound();
    }

    await this.addMembersToChannel({
      ...args,
      memberIds: [args.workspaceMemberId],
    });
  }

  async addMembers({
    memberIds,
    ...args
  }: AgentChatChannelAccessArgs & { memberIds: string[] }): Promise<void> {
    await this.channelAccessService.assertMemberOrManager(args);
    await this.findChannelOrThrow(args);
    await this.addMembersToChannel({ ...args, memberIds });
  }

  // Members leave on their own; removing someone else is left to who manages
  // the channel
  async removeMember({
    memberId,
    ...args
  }: AgentChatChannelAccessArgs & { memberId: string }): Promise<void> {
    if (memberId === args.workspaceMemberId) {
      await this.channelAccessService.assertChannelAccess({
        ...args,
        operationType: 'select',
      });
    } else {
      await this.channelAccessService.assertCanManageChannel(args);
    }

    const { memberTable, recordShareTable } = getAgentChatChannelTables(
      args.workspaceId,
    );

    const removedMembers = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager }) => {
        const removedMembers = await manager.query<
          AgentChatChannelMemberWorkspaceEntity[]
        >(
          `WITH removed_member AS (
             DELETE FROM ${memberTable}
             WHERE "channelId" = $1 AND "workspaceMemberId" = $2
             RETURNING ${MEMBER_COLUMNS}
           )
           SELECT * FROM removed_member`,
          [args.channelId, memberId],
        );

        await manager.query(
          `DELETE FROM ${recordShareTable} WHERE "sourceId" = ANY($1::uuid[]) AND "rowCause" = 'RULE'`,
          [removedMembers.map(({ id }) => id)],
        );

        return removedMembers;
      },
    );

    await this.channelRecordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.DESTROYED,
      recordsBefore: removedMembers,
    });
  }

  private async addMembersToChannel({
    memberIds,
    ...args
  }: AgentChatChannelAccessArgs & { memberIds: string[] }): Promise<void> {
    const { channelObjectMetadataId } =
      await this.channelAccessService.findChannelObjectMetadataIds(
        args.workspaceId,
      );

    const members = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) =>
        insertAgentChatChannelMembers({
          manager,
          workspaceId: args.workspaceId,
          channelId: args.channelId,
          memberIds,
          channelObjectMetadataId,
        }),
    );

    await this.channelRecordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.CREATED,
      recordsAfter: members,
    });
  }

  private async findChannelOrThrow({
    workspaceId,
    channelId,
  }: AgentChatChannelAccessArgs): Promise<AgentChatChannelWorkspaceEntity> {
    const { channelTable } = getAgentChatChannelTables(workspaceId);

    const [channel] = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<AgentChatChannelWorkspaceEntity[]>(
          `SELECT ${CHANNEL_COLUMNS} FROM ${channelTable}
           WHERE id = $1 AND "deletedAt" IS NULL`,
          [channelId],
        ),
    );

    return channel ?? throwAgentChatChannelNotFound();
  }

  private validateName(name: string): string {
    const trimmedName = name.trim();

    if (!isNonEmptyString(trimmedName)) {
      throw new AiException(
        'A channel needs a name',
        AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
      );
    }

    return trimmedName;
  }
}
