import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelVisibility } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  buildChannelVisibilityRuleSyncLockKey,
  CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS,
} from 'src/engine/permissions/channel-visibility/constants/channel-visibility-rule-sync-lock.constant';
import { buildChannelVisibilityRules } from 'src/engine/permissions/channel-visibility/utils/build-channel-visibility-rules.util';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { WorkspaceMemberIndividualRoleService } from 'src/engine/permissions/workspace-member-individual-role/services/workspace-member-individual-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const { message, calendarEvent } = STANDARD_OBJECTS;

@Injectable()
export class ChannelVisibilityRuleSyncService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMemberIndividualRoleService: WorkspaceMemberIndividualRoleService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  // two syncs of one workspace would each write the lists they read, and the older could land last
  async syncWorkspace(workspaceId: string): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.syncWorkspaceWithLock(workspaceId),
      buildChannelVisibilityRuleSyncLockKey(workspaceId),
      CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS,
    );
  }

  private async syncWorkspaceWithLock(workspaceId: string): Promise<void> {
    const { featureFlagsMap, flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
        'flatWorkspaceMemberMaps',
      ]);

    const userWorkspaceIds = isChannelVisibilityRlsEnabled(featureFlagsMap)
      ? Object.keys(flatWorkspaceMemberMaps.idByUserWorkspaceId)
      : [];

    const [messageChannels, calendarChannels] = await Promise.all([
      this.messageChannelRepository.find({
        where: { workspaceId },
        relations: { connectedAccount: true },
      }),
      this.calendarChannelRepository.find({
        where: { workspaceId },
        relations: { connectedAccount: true },
      }),
    ]);

    await this.workspaceMemberIndividualRoleService.syncIndividualRoles({
      workspaceId,
      individualRoles: userWorkspaceIds.map((userWorkspaceId) => ({
        userWorkspaceId,
        rules: [
          ...buildChannelVisibilityRules({
            userWorkspaceId,
            channels: messageChannels,
            objectMetadataUniversalIdentifier: message.universalIdentifier,
            associationRelationFieldMetadataUniversalIdentifier:
              message.fields.messageChannelMessageAssociations
                .universalIdentifier,
            channelIdFieldMetadataUniversalIdentifier:
              STANDARD_OBJECTS.messageChannelMessageAssociation.fields
                .messageChannelId.universalIdentifier,
            unreadableFieldMetadataUniversalIdentifiersByVisibility: {
              [MessageChannelVisibility.SUBJECT]: [
                message.fields.text.universalIdentifier,
                message.fields.attachments.universalIdentifier,
              ],
              [MessageChannelVisibility.METADATA]: [
                message.fields.subject.universalIdentifier,
                message.fields.text.universalIdentifier,
                message.fields.attachments.universalIdentifier,
              ],
            },
          }),
          ...buildChannelVisibilityRules({
            userWorkspaceId,
            channels: calendarChannels,
            objectMetadataUniversalIdentifier:
              calendarEvent.universalIdentifier,
            associationRelationFieldMetadataUniversalIdentifier:
              calendarEvent.fields.calendarChannelEventAssociations
                .universalIdentifier,
            channelIdFieldMetadataUniversalIdentifier:
              STANDARD_OBJECTS.calendarChannelEventAssociation.fields
                .calendarChannelId.universalIdentifier,
            unreadableFieldMetadataUniversalIdentifiersByVisibility: {
              [MessageChannelVisibility.METADATA]: [
                calendarEvent.fields.title.universalIdentifier,
                calendarEvent.fields.description.universalIdentifier,
              ],
            },
          }),
        ],
      })),
    });
  }
}
