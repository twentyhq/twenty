import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-record-event.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatChannelMemberWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel-member.workspace-entity';
import { type AgentChatChannelWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ChannelAccessArgs = {
  workspaceId: string;
  workspaceMemberId: string;
  channelId: string;
};

type ChannelChanges = {
  name?: string;
  icon?: string | null;
  color?: string | null;
  visibility?: AgentChatChannelVisibility;
};

const CHANNEL_COLUMNS = `id, name, icon, color, visibility, "createdAt", "updatedAt", "deletedAt"`;
const MEMBER_COLUMNS = `id, "channelId", "workspaceMemberId", position, "createdAt", "updatedAt", "deletedAt"`;

const throwChannelNotFound = (): never => {
  throw new AiException(
    'Chat channel not found',
    AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
  );
};

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
    private readonly recordSharingService: RecordSharingService,
    private readonly channelRecordEventService: AgentChatChannelRecordEventService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      await this.findChannelObjectMetadataIds(workspaceId);
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

        await this.writeGeneralAccess({
          manager,
          workspaceId,
          channelId: channel.id,
          visibility,
          channelObjectMetadataId,
        });

        const members = await this.insertMembers({
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
  // changes who can join it
  async updateChannel({
    changes,
    ...args
  }: ChannelAccessArgs & {
    changes: ChannelChanges;
  }): Promise<AgentChatChannelWorkspaceEntity> {
    await this.assertMemberOrManager(args);

    const before = await this.findChannelOrThrow(args);
    const isVisibilityChanged =
      isDefined(changes.visibility) && changes.visibility !== before.visibility;

    if (isVisibilityChanged) {
      await this.assertCanManageChannel(args);
    }

    const assignments: string[] = [];
    const parameters: unknown[] = [args.channelId];

    const assign = (column: string, value: unknown) => {
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
    if (isDefined(changes.visibility)) {
      assign('visibility', changes.visibility);
    }

    if (assignments.length === 0) {
      return before;
    }

    const { channelObjectMetadataId } = await this.findChannelObjectMetadataIds(
      args.workspaceId,
    );
    const { channelTable } = getAgentChatChannelTables(args.workspaceId);

    const after = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager }) => {
        const [after] = await manager.query<AgentChatChannelWorkspaceEntity[]>(
          `WITH updated_channel AS (
             UPDATE ${channelTable}
             SET ${assignments.join(', ')}, "updatedAt" = now()
             WHERE id = $1 AND "deletedAt" IS NULL
             RETURNING ${CHANNEL_COLUMNS}
           )
           SELECT * FROM updated_channel`,
          parameters,
        );

        if (isDefined(after) && isVisibilityChanged) {
          await this.writeGeneralAccess({
            manager,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
            visibility: after.visibility,
            channelObjectMetadataId,
          });
        }

        return after;
      },
    );

    if (!isDefined(after)) {
      return throwChannelNotFound();
    }

    await this.channelRecordEventService.emit({
      workspaceId: args.workspaceId,
      objectName: 'agentChatChannel',
      action: DatabaseEventAction.UPDATED,
      recordsBefore: [before],
      recordsAfter: [after],
    });

    return after;
  }

  // A channel's chats would read through nothing once it is gone, so they
  // move to another channel first
  async deleteChannel({
    destinationChannelId,
    ...args
  }: ChannelAccessArgs & {
    destinationChannelId: string | null;
  }): Promise<void> {
    await this.assertCanManageChannel(args);

    const channel = await this.findChannelOrThrow(args);

    if (isDefined(destinationChannelId)) {
      if (destinationChannelId === args.channelId) {
        throw new AiException(
          'A channel cannot move its chats to itself',
          AiExceptionCode.INVALID_CHAT_CHANNEL_DESTINATION,
        );
      }

      await this.assertChannelAccess({
        ...args,
        channelId: destinationChannelId,
        operationType: 'update',
      });
    }

    const { channelTable, memberTable, recordShareTable } =
      getAgentChatChannelTables(args.workspaceId);

    const members = await this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        // Taken first so a chat moved into the channel meanwhile is seen
        await manager.query(
          `SELECT id FROM ${channelTable} WHERE id = $1 FOR UPDATE`,
          [args.channelId],
        );

        const moved = await manager.query<{ id: string }[]>(
          `WITH moved_thread AS (
             UPDATE ${table('agentChatThread')}
             SET "channelId" = $2, "updatedAt" = now()
             WHERE "channelId" = $1 AND $2::uuid IS NOT NULL
             RETURNING id
           )
           SELECT id FROM moved_thread`,
          [args.channelId, destinationChannelId],
        );
        const [{ remainingThreadCount }] = await manager.query<
          { remainingThreadCount: number }[]
        >(
          `SELECT count(*)::int AS "remainingThreadCount"
           FROM ${table('agentChatThread')} WHERE "channelId" = $1`,
          [args.channelId],
        );

        if (remainingThreadCount > 0 && moved.length === 0) {
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

        return members;
      },
    );

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

  async joinChannel(args: ChannelAccessArgs): Promise<void> {
    await this.assertChannelAccess({ ...args, operationType: 'select' });

    const channel = await this.findChannelOrThrow(args);

    // A private channel is only joined by being added to it
    if (channel.visibility !== AgentChatChannelVisibility.PUBLIC) {
      return throwChannelNotFound();
    }

    await this.addMembersToChannel({
      ...args,
      memberIds: [args.workspaceMemberId],
    });
  }

  async addMembers({
    memberIds,
    ...args
  }: ChannelAccessArgs & { memberIds: string[] }): Promise<void> {
    await this.assertMemberOrManager(args);
    await this.findChannelOrThrow(args);
    await this.addMembersToChannel({ ...args, memberIds });
  }

  // Members leave on their own; removing someone else is left to who manages
  // the channel
  async removeMember({
    memberId,
    ...args
  }: ChannelAccessArgs & { memberId: string }): Promise<void> {
    if (memberId === args.workspaceMemberId) {
      await this.assertChannelAccess({ ...args, operationType: 'select' });
    } else {
      await this.assertCanManageChannel(args);
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

  async assertChannelAccess({
    operationType,
    ...args
  }: ChannelAccessArgs & { operationType: OperationType }): Promise<void> {
    const authContext = await this.sharingService.getAuthContext(args);

    const allowedChannelIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions('agentChatChannel')
            .findRecordIdsAllowedForOperation({
              recordIds: [args.channelId],
              operationType,
            }),
        authContext,
      );

    if (allowedChannelIds.length !== 1) {
      throwChannelNotFound();
    }
  }

  // Everyone can reply in a public channel, but only its members shape it
  private async assertMemberOrManager(args: ChannelAccessArgs): Promise<void> {
    await this.assertChannelAccess({ ...args, operationType: 'update' });

    const { memberTable } = getAgentChatChannelTables(args.workspaceId);
    const [membership] = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) =>
        manager.query<{ id: string }[]>(
          `SELECT id FROM ${memberTable}
           WHERE "channelId" = $1 AND "workspaceMemberId" = $2`,
          [args.channelId, args.workspaceMemberId],
        ),
    );

    if (!isDefined(membership)) {
      await this.assertCanManageChannel(args);
    }
  }

  private async assertCanManageChannel(args: ChannelAccessArgs): Promise<void> {
    const authContext = await this.sharingService.getAuthContext(args);
    const { channelObjectMetadataId } = await this.findChannelObjectMetadataIds(
      args.workspaceId,
    );

    const sharing = await this.recordSharingService
      .getSharing({
        objectMetadataId: channelObjectMetadataId,
        recordId: args.channelId,
        authContext,
      })
      .catch(() => throwChannelNotFound());

    if (!sharing.canManageSharing) {
      throw new AiException(
        'Only who manages the channel can do this',
        AiExceptionCode.CHAT_CHANNEL_MANAGEMENT_FORBIDDEN,
      );
    }
  }

  private async addMembersToChannel({
    memberIds,
    ...args
  }: ChannelAccessArgs & { memberIds: string[] }): Promise<void> {
    const { channelObjectMetadataId } = await this.findChannelObjectMetadataIds(
      args.workspaceId,
    );

    const members = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) =>
        this.insertMembers({
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

  // A member lands at the end of their sidebar. Removed workspace members and
  // existing memberships are skipped, so only new rows come back
  private async insertMembers({
    manager,
    workspaceId,
    channelId,
    memberIds,
    channelObjectMetadataId,
  }: {
    manager: EntityManager;
    workspaceId: string;
    channelId: string;
    memberIds: string[];
    channelObjectMetadataId: string;
  }): Promise<AgentChatChannelMemberWorkspaceEntity[]> {
    const uniqueMemberIds = [...new Set(memberIds)];

    if (uniqueMemberIds.length === 0) {
      return [];
    }

    const { memberTable, recordShareTable, workspaceMemberTable } =
      getAgentChatChannelTables(workspaceId);

    return manager.query<AgentChatChannelMemberWorkspaceEntity[]>(
      `WITH inserted_member AS (
         INSERT INTO ${memberTable} ("channelId", "workspaceMemberId", position)
         SELECT $1, member.id, (
           SELECT COALESCE(MAX(existing.position), 0) + 1
           FROM ${memberTable} existing
           WHERE existing."workspaceMemberId" = member.id
         )
         FROM ${workspaceMemberTable} member
         WHERE member.id = ANY($2::uuid[]) AND member."deletedAt" IS NULL
         ON CONFLICT ("channelId", "workspaceMemberId") DO NOTHING
         RETURNING ${MEMBER_COLUMNS}
       ), channel_grant AS (
         INSERT INTO ${recordShareTable}
           ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
         SELECT $3::uuid, inserted_member."channelId", inserted_member."workspaceMemberId", 'WORKSPACE_MEMBER', 'READ_WRITE', 'RULE', inserted_member.id
         FROM inserted_member
         ON CONFLICT DO NOTHING
       )
       SELECT * FROM inserted_member`,
      [channelId, uniqueMemberIds, channelObjectMetadataId],
    );
  }

  private async writeGeneralAccess({
    manager,
    workspaceId,
    channelId,
    visibility,
    channelObjectMetadataId,
  }: {
    manager: EntityManager;
    workspaceId: string;
    channelId: string;
    visibility: AgentChatChannelVisibility;
    channelObjectMetadataId: string;
  }): Promise<void> {
    const { recordShareTable } = getAgentChatChannelTables(workspaceId);

    if (visibility === AgentChatChannelVisibility.PRIVATE) {
      await manager.query(
        `DELETE FROM ${recordShareTable}
         WHERE "recordId" = $1 AND "principalType" = 'EVERYONE' AND "rowCause" = 'RULE'`,
        [channelId],
      );

      return;
    }

    await manager.query(
      `INSERT INTO ${recordShareTable}
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $3, 'EVERYONE', 'READ_WRITE', 'RULE', $2)
       ON CONFLICT DO NOTHING`,
      [channelObjectMetadataId, channelId, EVERYONE_PRINCIPAL_ID],
    );
  }

  private async findChannelOrThrow({
    workspaceId,
    channelId,
  }: ChannelAccessArgs): Promise<AgentChatChannelWorkspaceEntity> {
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

    return channel ?? throwChannelNotFound();
  }

  private async findChannelObjectMetadataIds(workspaceId: string) {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const channelObjectMetadata = findAgentChatFlatObjectMetadata(
      flatObjectMetadataMaps,
      'agentChatChannel',
    );

    if (!isDefined(channelObjectMetadata)) {
      throw new AiException(
        'Chat channels are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_THREAD_INBOX_STATE_UNAVAILABLE,
      );
    }

    return { channelObjectMetadataId: channelObjectMetadata.id };
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
