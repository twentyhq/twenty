import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  buildWorkspaceLockKey,
  WORKSPACE_LOCK_OPTIONS,
} from 'src/engine/core-modules/workspace/constants/workspace-lock.constant';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { buildChannelVisibilityObjectRecordsPermissions } from 'src/engine/permissions/channel-visibility/utils/build-channel-visibility-object-records-permissions.util';
import { type WorkspaceMemberIndividualRoleHolder } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';
import { WorkspaceMemberIndividualRoleService } from 'src/engine/permissions/workspace-member-individual-role/services/workspace-member-individual-role.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const { message, messageThread, calendarEvent } = STANDARD_OBJECTS;

@Injectable()
export class ChannelVisibilityRuleSyncService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMemberIndividualRoleService: WorkspaceMemberIndividualRoleService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async syncWorkspace(workspaceId: string): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.syncWorkspaceWithLock(workspaceId),
      buildWorkspaceLockKey(workspaceId),
      WORKSPACE_LOCK_OPTIONS,
    );
  }

  private async syncWorkspaceWithLock(workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      return;
    }

    await this.writeOrRemoveRules(workspaceId);
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);
  }

  private async writeOrRemoveRules(workspaceId: string): Promise<void> {
    const {
      flatWorkspaceMemberMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);
    const hasObject = (objectUniversalIdentifier: string) =>
      isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier],
      );
    const keepExistingFields = (fieldUniversalIdentifiers: string[]) =>
      fieldUniversalIdentifiers.filter((fieldUniversalIdentifier) =>
        isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier],
        ),
      );

    const holders: WorkspaceMemberIndividualRoleHolder[] = [
      ...Object.keys(flatWorkspaceMemberMaps.idByUserWorkspaceId).map(
        (userWorkspaceId) => ({
          type: 'userWorkspace' as const,
          userWorkspaceId,
        }),
      ),
      // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
      { type: 'apiKeys' as const },
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
                [MessageChannelVisibility.SUBJECT]: keepExistingFields([
                  message.fields.text.universalIdentifier,
                  message.fields.attachments.universalIdentifier,
                ]),
                [MessageChannelVisibility.METADATA]: keepExistingFields([
                  message.fields.subject.universalIdentifier,
                  message.fields.text.universalIdentifier,
                  message.fields.attachments.universalIdentifier,
                ]),
              },
              canUpdateRecords: false,
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
                [MessageChannelVisibility.METADATA]: keepExistingFields([
                  calendarEvent.fields.title.universalIdentifier,
                  calendarEvent.fields.description.universalIdentifier,
                  calendarEvent.fields.callRecordings.universalIdentifier,
                ]),
              },
              canUpdateRecords: true,
            }),
            ...[
              ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
              STANDARD_OBJECTS.attachment.universalIdentifier,
              STANDARD_OBJECTS.callRecording.universalIdentifier,
            ].map((objectUniversalIdentifier) => ({
              objectUniversalIdentifier,
            })),
          ]
            .filter(({ objectUniversalIdentifier }) =>
              hasObject(objectUniversalIdentifier),
            )
            .map((objectRecordsPermissions) => ({
              ...objectRecordsPermissions,
              canReadAllRecords: false,
              canCreateAllRecords: false,
              canUpdateAllRecords: false,
              canSoftDeleteAllRecords: false,
              canDestroyAllRecords: false,
            })),
        },
        unreadableNestedFields: [
          {
            objectUniversalIdentifier: messageThread.universalIdentifier,
            fieldUniversalIdentifier:
              messageThread.fields.subject.universalIdentifier,
            sourceFieldUniversalIdentifier:
              message.fields.subject.universalIdentifier,
          },
        ].filter(
          ({ fieldUniversalIdentifier, sourceFieldUniversalIdentifier }) =>
            keepExistingFields([
              fieldUniversalIdentifier,
              sourceFieldUniversalIdentifier,
            ]).length === 2,
        ),
      })),
    });
  }
}
