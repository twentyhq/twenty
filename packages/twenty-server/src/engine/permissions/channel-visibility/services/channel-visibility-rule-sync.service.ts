import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CalendarChannelVisibility,
  FeatureFlagKey,
  MessageChannelVisibility,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v5 } from 'uuid';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { buildFieldByObjectIdAndNameKey } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-by-object-id-and-name-key.util';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE } from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';
import { PersonalRoleService } from 'src/engine/permissions/channel-visibility/services/personal-role.service';
import { type ChannelVisibilityLevel } from 'src/engine/permissions/channel-visibility/types/channel-visibility-level.type';
import { type VisibilityChannel } from 'src/engine/permissions/channel-visibility/types/visibility-channel.type';
import { isPersonalRole } from 'src/engine/permissions/channel-visibility/utils/is-personal-role.util';
import { computeChannelIdsByVisibilityLevel } from 'src/engine/permissions/channel-visibility/utils/compute-channel-ids-by-visibility-level.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ChannelVisibilityObjectRules = {
  objectNameSingular: string;
  associationRelationFieldName: string;
  associationObjectNameSingular: string;
  channelIdFieldName: string;
  hiddenFieldNamesByLevel: Partial<Record<ChannelVisibilityLevel, string[]>>;
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

@Injectable()
export class ChannelVisibilityRuleSyncService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly personalRoleService: PersonalRoleService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async syncWorkspace(workspaceId: string): Promise<void> {
    const { featureFlagsMap, flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
        'flatWorkspaceMemberMaps',
      ]);

    if (!featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED]) {
      return;
    }

    const userWorkspaceIds = Object.keys(
      flatWorkspaceMemberMaps.idByUserWorkspaceId,
    );
    const personalRoleIdByUserWorkspaceId =
      await this.personalRoleService.ensurePersonalRoles({
        workspaceId,
        userWorkspaceIds,
      });
    const objectsRules = await this.findObjectsRules(workspaceId);

    await this.revokeRoleGrantsOnChannelObjects({
      workspaceId,
      objectNameSingulars: objectsRules.map(
        ({ objectNameSingular }) => objectNameSingular,
      ),
    });

    for (const [userWorkspaceId, roleId] of personalRoleIdByUserWorkspaceId) {
      for (const objectRules of objectsRules) {
        await this.syncRoleObjectRules({
          workspaceId,
          userWorkspaceId,
          roleId,
          objectRules,
        });
      }
    }
  }

  // an all records grant wins over rules, so what roles granted before would show every message unmasked
  private async revokeRoleGrantsOnChannelObjects({
    workspaceId,
    objectNameSingulars,
  }: {
    workspaceId: string;
    objectNameSingulars: string[];
  }): Promise<void> {
    const { objectIdByName } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['objectIdByName'],
    );
    const { flatRoleMaps, flatObjectPermissionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps', 'flatObjectPermissionMaps'],
        },
      );
    const channelObjectMetadataIds = objectNameSingulars
      .map((objectNameSingular) => objectIdByName[objectNameSingular])
      .filter(isDefined);
    const flatObjectPermissions = Object.values(
      flatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(isDefined);

    for (const flatRole of Object.values(flatRoleMaps.byUniversalIdentifier)) {
      if (!isDefined(flatRole) || isPersonalRole(flatRole)) {
        continue;
      }

      const roleObjectPermissions = flatObjectPermissions.filter(
        ({ roleId }) => roleId === flatRole.id,
      );
      const isAlreadyRevoked = channelObjectMetadataIds.every(
        (objectMetadataId) =>
          roleObjectPermissions.some(
            (objectPermission) =>
              objectPermission.objectMetadataId === objectMetadataId,
          ),
      );

      if (isAlreadyRevoked) {
        continue;
      }

      await this.objectPermissionService.upsertObjectPermissions({
        workspaceId,
        isSystemBuild: true,
        input: {
          roleId: flatRole.id,
          objectPermissions: [
            ...roleObjectPermissions
              .filter(
                ({ objectMetadataId }) =>
                  !channelObjectMetadataIds.includes(objectMetadataId),
              )
              .map((objectPermission) => ({
                objectMetadataId: objectPermission.objectMetadataId,
                canReadObjectRecords:
                  objectPermission.canReadObjectRecords ?? undefined,
                canUpdateObjectRecords:
                  objectPermission.canUpdateObjectRecords ?? undefined,
                canSoftDeleteObjectRecords:
                  objectPermission.canSoftDeleteObjectRecords ?? undefined,
                canDestroyObjectRecords:
                  objectPermission.canDestroyObjectRecords ?? undefined,
              })),
            ...channelObjectMetadataIds.map((objectMetadataId) => ({
              objectMetadataId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            })),
          ],
        },
      });
    }
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
        hiddenFieldNamesByLevel: {
          subject: ['text'],
          metadata: ['subject', 'text'],
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
        hiddenFieldNamesByLevel: { metadata: ['title', 'description'] },
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

  private async syncRoleObjectRules({
    workspaceId,
    userWorkspaceId,
    roleId,
    objectRules,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    roleId: string;
    objectRules: ChannelVisibilityObjectRules;
  }): Promise<void> {
    const { objectIdByName, fieldIdByObjectIdAndName } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'objectIdByName',
        'fieldIdByObjectIdAndName',
      ]);
    const objectMetadataId = objectIdByName[objectRules.objectNameSingular];
    const associationObjectMetadataId =
      objectIdByName[objectRules.associationObjectNameSingular];

    if (
      !isDefined(objectMetadataId) ||
      !isDefined(associationObjectMetadataId)
    ) {
      return;
    }

    const findFieldIdOrThrow = (objectId: string, fieldName: string) => {
      const fieldMetadataId = fieldIdByObjectIdAndName.get(
        buildFieldByObjectIdAndNameKey(objectId, fieldName),
      );

      if (!isDefined(fieldMetadataId)) {
        throw new Error(
          `Field ${fieldName} not found for channel visibility rules`,
        );
      }

      return fieldMetadataId;
    };
    const relationFieldMetadataId = findFieldIdOrThrow(
      objectMetadataId,
      objectRules.associationRelationFieldName,
    );
    const channelIdFieldMetadataId = findFieldIdOrThrow(
      associationObjectMetadataId,
      objectRules.channelIdFieldName,
    );
    const channelIdsByVisibilityLevel = computeChannelIdsByVisibilityLevel({
      channels: objectRules.channels,
      userWorkspaceId,
    });
    // a rule without a channel would be refused, and grants nothing anyway
    const levels = (
      Object.keys(channelIdsByVisibilityLevel) as ChannelVisibilityLevel[]
    ).filter((level) => channelIdsByVisibilityLevel[level].length > 0);
    const buildId = (level: ChannelVisibilityLevel, kind: string) =>
      v5(
        `${roleId}:${objectMetadataId}:${level}:${kind}`,
        PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
      );

    await this.rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates(
      {
        workspaceId,
        isSystemBuild: true,
        input: {
          roleId,
          objectMetadataId,
          canReadRecords: true,
          canCreateRecords: false,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
          predicateGroups: levels.map((level, index) => ({
            id: buildId(level, 'group'),
            objectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            positionInRowLevelPermissionPredicateGroup: index,
          })),
          predicates: levels.map((level) => ({
            id: buildId(level, 'predicate'),
            fieldMetadataId: channelIdFieldMetadataId,
            relationFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.IS,
            value: channelIdsByVisibilityLevel[level],
            rowLevelPermissionPredicateGroupId: buildId(level, 'group'),
            positionInRowLevelPermissionPredicateGroup: 0,
          })),
        },
      },
    );

    const fieldPermissions = levels.flatMap((level) =>
      (objectRules.hiddenFieldNamesByLevel[level] ?? []).map((fieldName) => ({
        objectMetadataId,
        fieldMetadataId: findFieldIdOrThrow(objectMetadataId, fieldName),
        rowLevelPermissionPredicateGroupId: buildId(level, 'group'),
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      })),
    );

    if (fieldPermissions.length > 0) {
      await this.fieldPermissionService.upsertFieldPermissions({
        workspaceId,
        isSystemBuild: true,
        input: { roleId, fieldPermissions },
      });
    }
  }
}
