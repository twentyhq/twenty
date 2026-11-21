import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { buildFieldByObjectIdAndNameKey } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-by-object-id-and-name-key.util';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  buildChannelVisibilityRuleSyncLockKey,
  CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS,
} from 'src/engine/permissions/channel-visibility/constants/channel-visibility-rule-sync-lock.constant';
import { type ChannelVisibilityLevel } from 'src/engine/permissions/channel-visibility/types/channel-visibility-level.type';
import { WorkspaceMemberIndividualRoleService } from 'src/engine/permissions/workspace-member-individual-role/services/workspace-member-individual-role.service';
import { type WorkspaceMemberIndividualRoleRule } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';
import { type VisibilityChannel } from 'src/engine/permissions/channel-visibility/types/visibility-channel.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { computeChannelIdsByVisibilityLevel } from 'src/engine/permissions/channel-visibility/utils/compute-channel-ids-by-visibility-level.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ChannelVisibilityObjectRules = {
  objectNameSingular: string;
  associationRelationFieldName: string;
  associationObjectNameSingular: string;
  channelIdFieldName: string;
  unreadableFieldNamesByLevel: Partial<
    Record<ChannelVisibilityLevel, string[]>
  >;
  channels: VisibilityChannel[];
};

const MESSAGE_SHARED_LEVEL: Record<
  MessageChannelVisibility,
  ChannelVisibilityLevel
> = {
  [MessageChannelVisibility.SHARE_EVERYTHING]: 'full',
  [MessageChannelVisibility.SUBJECT]: 'subject',
  [MessageChannelVisibility.METADATA]: 'metadata',
};

const CHANNEL_VISIBILITY_LEVELS: ChannelVisibilityLevel[] = [
  'full',
  'subject',
  'metadata',
];

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
    const {
      featureFlagsMap,
      flatWorkspaceMemberMaps,
      objectIdByName,
      fieldIdByObjectIdAndName,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'flatWorkspaceMemberMaps',
      'objectIdByName',
      'fieldIdByObjectIdAndName',
    ]);

    if (!isChannelVisibilityRlsEnabled(featureFlagsMap)) {
      await this.workspaceMemberIndividualRoleService.syncIndividualRoles({
        workspaceId,
        individualRoles: [],
      });

      return;
    }

    const objectsRules = await this.findObjectsRules(workspaceId);

    await this.workspaceMemberIndividualRoleService.syncIndividualRoles({
      workspaceId,
      individualRoles: Object.keys(
        flatWorkspaceMemberMaps.idByUserWorkspaceId,
      ).map((userWorkspaceId) => ({
        userWorkspaceId,
        rules: objectsRules.flatMap((objectRules) =>
          this.buildObjectRules({
            userWorkspaceId,
            objectRules,
            objectIdByName,
            fieldIdByObjectIdAndName,
          }),
        ),
      })),
    });
  }

  private async findObjectsRules(
    workspaceId: string,
  ): Promise<ChannelVisibilityObjectRules[]> {
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

    return [
      {
        objectNameSingular: 'message',
        associationRelationFieldName: 'messageChannelMessageAssociations',
        associationObjectNameSingular: 'messageChannelMessageAssociation',
        channelIdFieldName: 'messageChannelId',
        unreadableFieldNamesByLevel: {
          subject: ['text', 'attachments'],
          metadata: ['subject', 'text', 'attachments'],
        },
        channels: messageChannels.map((messageChannel) => ({
          id: messageChannel.id,
          ownerUserWorkspaceId:
            messageChannel.connectedAccount?.userWorkspaceId ?? null,
          sharedLevel: MESSAGE_SHARED_LEVEL[messageChannel.visibility],
        })),
      },
      {
        objectNameSingular: 'calendarEvent',
        associationRelationFieldName: 'calendarChannelEventAssociations',
        associationObjectNameSingular: 'calendarChannelEventAssociation',
        channelIdFieldName: 'calendarChannelId',
        unreadableFieldNamesByLevel: { metadata: ['title', 'description'] },
        channels: calendarChannels.map((calendarChannel) => ({
          id: calendarChannel.id,
          ownerUserWorkspaceId:
            calendarChannel.connectedAccount?.userWorkspaceId ?? null,
          sharedLevel:
            calendarChannel.visibility ===
            CalendarChannelVisibility.SHARE_EVERYTHING
              ? 'full'
              : 'metadata',
        })),
      },
    ];
  }

  private buildObjectRules({
    userWorkspaceId,
    objectRules,
    objectIdByName,
    fieldIdByObjectIdAndName,
  }: {
    userWorkspaceId: string;
    objectRules: ChannelVisibilityObjectRules;
    objectIdByName: Record<string, string | undefined>;
    fieldIdByObjectIdAndName: Map<string, string>;
  }): WorkspaceMemberIndividualRoleRule[] {
    const objectMetadataId = objectIdByName[objectRules.objectNameSingular];
    const associationObjectMetadataId =
      objectIdByName[objectRules.associationObjectNameSingular];

    if (
      !isDefined(objectMetadataId) ||
      !isDefined(associationObjectMetadataId)
    ) {
      return [];
    }

    const findFieldIdOrThrow = ({
      objectId,
      fieldName,
    }: {
      objectId: string;
      fieldName: string;
    }) => {
      const fieldMetadataId = fieldIdByObjectIdAndName.get(
        buildFieldByObjectIdAndNameKey(objectId, fieldName),
      );

      if (!isDefined(fieldMetadataId)) {
        throw new PermissionsException(
          `Field ${fieldName} not found for channel visibility rules`,
          PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      return fieldMetadataId;
    };
    const relationFieldMetadataId = findFieldIdOrThrow({
      objectId: objectMetadataId,
      fieldName: objectRules.associationRelationFieldName,
    });
    const channelIdFieldMetadataId = findFieldIdOrThrow({
      objectId: associationObjectMetadataId,
      fieldName: objectRules.channelIdFieldName,
    });
    const channelIdsByVisibilityLevel = computeChannelIdsByVisibilityLevel({
      channels: objectRules.channels,
      userWorkspaceId,
    });

    // a rule without a channel would be refused, and grants nothing anyway
    return CHANNEL_VISIBILITY_LEVELS.filter(
      (level) => channelIdsByVisibilityLevel[level].length > 0,
    ).map((level) => ({
      ruleKey: `${objectMetadataId}:${level}`,
      objectMetadataId,
      fieldMetadataId: channelIdFieldMetadataId,
      relationFieldMetadataId,
      operand: RowLevelPermissionPredicateOperand.IS,
      value: channelIdsByVisibilityLevel[level],
      unreadableFieldMetadataIds: (
        objectRules.unreadableFieldNamesByLevel[level] ?? []
      ).map((fieldName) =>
        findFieldIdOrThrow({ objectId: objectMetadataId, fieldName }),
      ),
    }));
  }
}
