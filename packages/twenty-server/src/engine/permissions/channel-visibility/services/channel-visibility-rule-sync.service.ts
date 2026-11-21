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

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { buildFieldByObjectIdAndNameKey } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-by-object-id-and-name-key.util';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { type UpsertRowLevelPermissionRulesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-rules.input';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import {
  buildChannelVisibilityRuleSyncLockKey,
  CHANNEL_VISIBILITY_RULE_SYNC_LOCK_OPTIONS,
} from 'src/engine/permissions/channel-visibility/constants/channel-visibility-rule-sync-lock.constant';
import { PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE } from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';
import { PersonalRoleService } from 'src/engine/permissions/channel-visibility/services/personal-role.service';
import { type ChannelVisibilityLevel } from 'src/engine/permissions/channel-visibility/types/channel-visibility-level.type';
import { type VisibilityChannel } from 'src/engine/permissions/channel-visibility/types/visibility-channel.type';
import { isPersonalRole } from 'src/engine/permissions/channel-visibility/utils/is-personal-role.util';
import { computeChannelIdsByVisibilityLevel } from 'src/engine/permissions/channel-visibility/utils/compute-channel-ids-by-visibility-level.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
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

// a role keeps the attachments of its role wide grant, except the ones of a message
const buildAttachmentNotOfMessageRule = ({
  flatRole,
  buildId,
  targetMessageFieldMetadataId,
}: {
  flatRole: FlatRole;
  buildId: (kind: string) => string;
  targetMessageFieldMetadataId: string;
}): UpsertRowLevelPermissionRulesInput['rules'][number] => ({
  id: buildId('rule'),
  canReadRecords: true,
  canUpdateRecords: flatRole.canUpdateAllObjectRecords,
  canSoftDeleteRecords: flatRole.canSoftDeleteAllObjectRecords,
  canDestroyRecords: flatRole.canDestroyAllObjectRecords,
  predicateGroups: [
    {
      id: buildId('group'),
      logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
      predicates: [
        {
          id: buildId('predicate'),
          fieldMetadataId: targetMessageFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
          value: null,
        },
      ],
    },
  ],
});

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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

    const { objectIdByName, fieldIdByObjectIdAndName } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'objectIdByName',
        'fieldIdByObjectIdAndName',
      ]);

    if (!featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED]) {
      await this.personalRoleService.deletePersonalRoles({ workspaceId });
      await this.rowLevelPermissionPredicateService.upsertManySystemRowLevelPermissionRules(
        {
          workspaceId,
          inputs: await this.buildAttachmentRulesInputs({
            workspaceId,
            objectIdByName,
            fieldIdByObjectIdAndName,
            isChannelVisibilityRlsEnabled: false,
          }),
        },
      );

      return;
    }

    const userWorkspaceIds = Object.keys(
      flatWorkspaceMemberMaps.idByUserWorkspaceId,
    );

    await this.personalRoleService.deletePersonalRoles({
      workspaceId,
      keptUserWorkspaceIds: userWorkspaceIds,
    });

    const personalRoleIdByUserWorkspaceId =
      await this.personalRoleService.ensurePersonalRoles({
        workspaceId,
        userWorkspaceIds,
      });
    const objectsRules = await this.findObjectsRules(workspaceId);

    const personalRolesInputs = [...personalRoleIdByUserWorkspaceId].flatMap(
      ([userWorkspaceId, roleId]) =>
        objectsRules
          .map((objectRules) =>
            this.buildRoleObjectRules({
              userWorkspaceId,
              roleId,
              objectRules,
              objectIdByName,
              fieldIdByObjectIdAndName,
            }),
          )
          .filter(isDefined),
    );

    await this.rowLevelPermissionPredicateService.upsertManySystemRowLevelPermissionRules(
      {
        workspaceId,
        inputs: [
          ...personalRolesInputs,
          ...(await this.buildAttachmentRulesInputs({
            workspaceId,
            objectIdByName,
            fieldIdByObjectIdAndName,
            isChannelVisibilityRlsEnabled: true,
          })),
        ],
      },
    );
  }

  private async buildAttachmentRulesInputs({
    workspaceId,
    objectIdByName,
    fieldIdByObjectIdAndName,
    isChannelVisibilityRlsEnabled,
  }: {
    workspaceId: string;
    objectIdByName: Record<string, string | undefined>;
    fieldIdByObjectIdAndName: Map<string, string>;
    isChannelVisibilityRlsEnabled: boolean;
  }): Promise<
    {
      rulesInput: UpsertRowLevelPermissionRulesInput;
      fieldPermissions: UpsertFieldPermissionsInput['fieldPermissions'];
    }[]
  > {
    const objectMetadataId = objectIdByName.attachment;
    const targetMessageFieldMetadataId = isDefined(objectMetadataId)
      ? fieldIdByObjectIdAndName.get(
          buildFieldByObjectIdAndNameKey(objectMetadataId, 'targetMessage'),
        )
      : undefined;

    if (
      !isDefined(objectMetadataId) ||
      !isDefined(targetMessageFieldMetadataId)
    ) {
      return [];
    }

    const {
      flatRoleMaps,
      flatObjectPermissionMaps,
      flatRowLevelPermissionRuleMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRoleMaps',
            'flatObjectPermissionMaps',
            'flatRowLevelPermissionRuleMaps',
          ],
        },
      );
    const roleIdsWithObjectPermission = new Set(
      Object.values(flatObjectPermissionMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (objectPermission) =>
            objectPermission.objectMetadataId === objectMetadataId,
        )
        .map(({ roleId }) => roleId),
    );
    const ruleIdsByRoleId = new Map<string, string[]>();

    for (const rule of Object.values(
      flatRowLevelPermissionRuleMaps.byUniversalIdentifier,
    )) {
      if (isDefined(rule) && rule.objectMetadataId === objectMetadataId) {
        ruleIdsByRoleId.set(rule.roleId, [
          ...(ruleIdsByRoleId.get(rule.roleId) ?? []),
          rule.id,
        ]);
      }
    }

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatRole) => !isPersonalRole(flatRole))
      .flatMap((flatRole) => {
        const buildId = (kind: string) =>
          v5(
            `${flatRole.id}:${objectMetadataId}:notOfMessage:${kind}`,
            PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
          );
        const ruleIds = ruleIdsByRoleId.get(flatRole.id) ?? [];
        const hasOwnRules = ruleIds.some(
          (ruleId) => ruleId !== buildId('rule'),
        );
        const hasSystemRule = ruleIds.includes(buildId('rule'));
        const shouldHaveSystemRule =
          isChannelVisibilityRlsEnabled &&
          flatRole.canReadAllObjectRecords &&
          !roleIdsWithObjectPermission.has(flatRole.id);

        // an upsert replaces every rule of the role on attachments, so a role with rules of its own is left alone
        if (hasOwnRules || (!shouldHaveSystemRule && !hasSystemRule)) {
          return [];
        }

        return [
          {
            fieldPermissions: [],
            rulesInput: {
              roleId: flatRole.id,
              objectMetadataId,
              rules: shouldHaveSystemRule
                ? [
                    buildAttachmentNotOfMessageRule({
                      flatRole,
                      buildId,
                      targetMessageFieldMetadataId,
                    }),
                  ]
                : [],
            },
          },
        ];
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

  private buildRoleObjectRules({
    userWorkspaceId,
    roleId,
    objectRules,
    objectIdByName,
    fieldIdByObjectIdAndName,
  }: {
    userWorkspaceId: string;
    roleId: string;
    objectRules: ChannelVisibilityObjectRules;
    objectIdByName: Record<string, string | undefined>;
    fieldIdByObjectIdAndName: Map<string, string>;
  }):
    | {
        rulesInput: UpsertRowLevelPermissionRulesInput;
        fieldPermissions: UpsertFieldPermissionsInput['fieldPermissions'];
      }
    | undefined {
    const objectMetadataId = objectIdByName[objectRules.objectNameSingular];
    const associationObjectMetadataId =
      objectIdByName[objectRules.associationObjectNameSingular];

    if (
      !isDefined(objectMetadataId) ||
      !isDefined(associationObjectMetadataId)
    ) {
      return undefined;
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
    const levels = CHANNEL_VISIBILITY_LEVELS.filter(
      (level) => channelIdsByVisibilityLevel[level].length > 0,
    );
    const buildId = (level: ChannelVisibilityLevel, kind: string) =>
      v5(
        `${roleId}:${objectMetadataId}:${level}:${kind}`,
        PERSONAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
      );

    const rulesInput: UpsertRowLevelPermissionRulesInput = {
      roleId,
      objectMetadataId,
      rules: levels.map((level) => ({
        id: buildId(level, 'rule'),
        canReadRecords: true,
        predicateGroups: [
          {
            id: buildId(level, 'group'),
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            predicates: [
              {
                id: buildId(level, 'predicate'),
                fieldMetadataId: channelIdFieldMetadataId,
                relationFieldMetadataId,
                operand: RowLevelPermissionPredicateOperand.IS,
                value: channelIdsByVisibilityLevel[level],
              },
            ],
          },
        ],
      })),
    };

    const fieldPermissions = levels.flatMap((level) =>
      (objectRules.unreadableFieldNamesByLevel[level] ?? []).map(
        (fieldName) => ({
          objectMetadataId,
          fieldMetadataId: findFieldIdOrThrow({
            objectId: objectMetadataId,
            fieldName,
          }),
          rowLevelPermissionPredicateGroupId: buildId(level, 'group'),
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        }),
      ),
    );

    return { rulesInput, fieldPermissions };
  }
}
