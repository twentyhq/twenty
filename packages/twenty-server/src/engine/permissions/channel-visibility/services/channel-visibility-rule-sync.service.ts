import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  buildChannelVisibilityRuleSyncLockKey,
  CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS,
} from 'src/engine/permissions/channel-visibility/constants/channel-visibility-rule-sync-lock.constant';
import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { buildChannelVisibilityObjectRecordsPermissions } from 'src/engine/permissions/channel-visibility/utils/build-channel-visibility-object-records-permissions.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  getApiKeysIndividualRoleWriteGrants,
  isRoleRevokedForApiKeys,
} from 'src/engine/permissions/channel-visibility/utils/get-api-keys-individual-role-write-grants.util';
import { getWorkspaceMemberIndividualRoleUniversalIdentifier } from 'src/engine/permissions/workspace-member-individual-role/utils/get-workspace-member-individual-role-universal-identifier.util';
import { isApiKeyExemptFromChannelVisibility } from 'src/engine/permissions/channel-visibility/utils/is-api-key-exempt-from-channel-visibility.util';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { type WorkspaceMemberIndividualRoleHolder } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';
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

  async syncWorkspace(workspaceId: string): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.syncWorkspaceWithLock(workspaceId),
      buildChannelVisibilityRuleSyncLockKey(workspaceId),
      CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS,
    );
  }

  private async syncWorkspaceWithLock(workspaceId: string): Promise<void> {
    await this.writeOrRemoveRules(workspaceId);
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);
  }

  private async writeOrRemoveRules(workspaceId: string): Promise<void> {
    const { featureFlagsMap, flatWorkspaceMemberMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
        'flatWorkspaceMemberMaps',
        'flatRoleMaps',
      ]);

    const holders: WorkspaceMemberIndividualRoleHolder[] = [
      ...(isChannelVisibilityRlsEnabled(featureFlagsMap)
        ? Object.keys(flatWorkspaceMemberMaps.idByUserWorkspaceId).map(
            (userWorkspaceId) => ({
              type: 'userWorkspace' as const,
              userWorkspaceId,
            }),
          )
        : []),
      ...(isApiKeyExemptFromChannelVisibility(featureFlagsMap)
        ? this.findApiKeysHolders(flatRoleMaps)
        : []),
    ];

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
      individualRoles: holders.map((holder) => ({
        holder,
        recordsPermissions: {
          objects: [
            buildChannelVisibilityObjectRecordsPermissions({
              holder,
              channels: messageChannels,
              objectUniversalIdentifier: message.universalIdentifier,
              associationRelationFieldUniversalIdentifier:
                message.fields.messageChannelMessageAssociations
                  .universalIdentifier,
              channelIdFieldUniversalIdentifier:
                STANDARD_OBJECTS.messageChannelMessageAssociation.fields
                  .messageChannelId.universalIdentifier,
              unreadableFieldUniversalIdentifiersByVisibility: {
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
            buildChannelVisibilityObjectRecordsPermissions({
              holder,
              channels: calendarChannels,
              objectUniversalIdentifier: calendarEvent.universalIdentifier,
              associationRelationFieldUniversalIdentifier:
                calendarEvent.fields.calendarChannelEventAssociations
                  .universalIdentifier,
              channelIdFieldUniversalIdentifier:
                STANDARD_OBJECTS.calendarChannelEventAssociation.fields
                  .calendarChannelId.universalIdentifier,
              unreadableFieldUniversalIdentifiersByVisibility: {
                [MessageChannelVisibility.METADATA]: [
                  calendarEvent.fields.title.universalIdentifier,
                  calendarEvent.fields.description.universalIdentifier,
                ],
              },
            }),
            ...[
              ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
              STANDARD_OBJECTS.attachment.universalIdentifier,
            ].map((objectUniversalIdentifier) => ({
              objectUniversalIdentifier,
            })),
          ].map((objectRecordsPermissions) => ({
            ...objectRecordsPermissions,
            canReadAllRecords: false,
            ...(holder.type === 'apiKeys'
              ? {
                  canCreateAllRecords:
                    holder.writeGrants.canCreateAllObjectRecords,
                  canUpdateAllRecords:
                    holder.writeGrants.canUpdateAllObjectRecords,
                  canSoftDeleteAllRecords:
                    holder.writeGrants.canSoftDeleteAllObjectRecords,
                  canDestroyAllRecords:
                    holder.writeGrants.canDestroyAllObjectRecords,
                }
              : {
                  canCreateAllRecords: false,
                  canUpdateAllRecords: false,
                  canSoftDeleteAllRecords: false,
                  canDestroyAllRecords: false,
                }),
          })),
        },
      })),
    });
  }

  private findApiKeysHolders(
    flatRoleMaps: FlatEntityMaps<FlatRole>,
  ): WorkspaceMemberIndividualRoleHolder[] {
    const writeGrantsByUniversalIdentifier = new Map(
      Object.values(flatRoleMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (flatRole) =>
            flatRole.canBeAssignedToApiKeys &&
            isRoleRevokedForApiKeys({ flatRole }),
        )
        .map((flatRole) => {
          const holder = {
            type: 'apiKeys' as const,
            writeGrants: getApiKeysIndividualRoleWriteGrants({ flatRole }),
          };

          return [
            getWorkspaceMemberIndividualRoleUniversalIdentifier({ holder }),
            holder,
          ] as const;
        }),
    );

    return [...writeGrantsByUniversalIdentifier.values()];
  }
}
