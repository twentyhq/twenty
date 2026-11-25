import { Injectable, Logger } from '@nestjs/common';

import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-records-permissions.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS } from 'src/engine/permissions/channel-visibility/constants/channel-record-rule-universal-identifier-seeds.constant';
import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { getChannelRecordRuleUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-channel-record-rule-universal-identifier.util';
import { ChannelVisibilityRuleSyncSchedulerService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync-scheduler.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

const CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
];

const { attachment, callRecording } = STANDARD_OBJECTS;

const OBJECTS_FOLLOWING_A_CHANNEL_RECORD = [
  {
    objectUniversalIdentifier: attachment.universalIdentifier,
    channelRecordFieldUniversalIdentifier:
      attachment.fields.targetMessage.universalIdentifier,
    ruleUniversalIdentifierSeed: 'attachmentNotOfMessage' as const,
    recordsFollowingAChannelRecord: 'message attachments',
  },
  {
    objectUniversalIdentifier: callRecording.universalIdentifier,
    channelRecordFieldUniversalIdentifier:
      callRecording.fields.calendarEvent.universalIdentifier,
    ruleUniversalIdentifierSeed: 'callRecordingNotOfCalendarEvent' as const,
    recordsFollowingAChannelRecord: 'call recordings of calendar events',
  },
];

const NO_RECORDS_PERMISSIONS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

@Injectable()
export class ChannelVisibilityRoleWideAccessRevokeService {
  private readonly logger = new Logger(
    ChannelVisibilityRoleWideAccessRevokeService.name,
  );

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly channelVisibilityRuleSyncSchedulerService: ChannelVisibilityRuleSyncSchedulerService,
  ) {}

  async findChannelRecordPredicateGroupIds(
    workspaceId: string,
  ): Promise<string[]> {
    const { flatRoleMaps, flatRowLevelPermissionPredicateGroupMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'flatRowLevelPermissionPredicateGroupMaps',
      ]);

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .flatMap(({ universalIdentifier: roleUniversalIdentifier }) =>
        CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS.map(
          (ruleUniversalIdentifierSeed) =>
            flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier[
              getChannelRecordRuleUniversalIdentifier({
                ruleUniversalIdentifierSeed,
                roleUniversalIdentifier,
                kind: 'group',
              })
            ]?.id,
        ),
      )
      .filter(isDefined);
  }

  async revokeRoleWideAccess({
    workspaceId,
    isDryRun = false,
  }: {
    workspaceId: string;
    isDryRun?: boolean;
  }): Promise<void> {
    const {
      flatRoleMaps,
      flatObjectPermissionMaps,
      flatObjectMetadataMaps,
      rolesPermissions,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'rolesPermissions',
      'flatRoleMaps',
      'flatObjectPermissionMaps',
      'flatObjectMetadataMaps',
    ]);

    const userRoles = Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ canBeAssignedToUsers }) => canBeAssignedToUsers);
    const channelObjectUniversalIdentifiers =
      CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS.filter((objectUniversalIdentifier) =>
        isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ],
        ),
      );
    const existingObjectPermissions = Object.values(
      flatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const now = new Date().toISOString();

    const operationsByApplicationUniversalIdentifier = new Map<
      string,
      {
        flatEntityToCreate: (UniversalFlatObjectPermission & { id?: string })[];
        flatEntityToUpdate: UniversalFlatObjectPermission[];
        rulesToCreate: UniversalFlatRowLevelPermissionRule[];
        predicateGroupsToCreate: UniversalFlatRowLevelPermissionPredicateGroup[];
        predicatesToCreate: UniversalFlatRowLevelPermissionPredicate[];
      }
    >();

    for (const {
      id: roleId,
      label,
      universalIdentifier: roleUniversalIdentifier,
      applicationUniversalIdentifier,
    } of userRoles) {
      const operations = operationsByApplicationUniversalIdentifier.get(
        applicationUniversalIdentifier,
      ) ?? {
        flatEntityToCreate: [],
        flatEntityToUpdate: [],
        rulesToCreate: [],
        predicateGroupsToCreate: [],
        predicatesToCreate: [],
      };

      operationsByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        operations,
      );

      for (const objectMetadataUniversalIdentifier of channelObjectUniversalIdentifiers) {
        const existingObjectPermission = existingObjectPermissions.find(
          (objectPermission) =>
            objectPermission.roleUniversalIdentifier ===
              roleUniversalIdentifier &&
            objectPermission.objectMetadataUniversalIdentifier ===
              objectMetadataUniversalIdentifier,
        );

        if (!isDefined(existingObjectPermission)) {
          operations.flatEntityToCreate.push({
            id: v4(),
            universalIdentifier: getObjectPermissionUniversalIdentifier({
              applicationUniversalIdentifier,
              roleUniversalIdentifier,
              objectUniversalIdentifier: objectMetadataUniversalIdentifier,
            }),
            applicationUniversalIdentifier,
            roleUniversalIdentifier,
            objectMetadataUniversalIdentifier,
            ...NO_RECORDS_PERMISSIONS,
            createdAt: now,
            updatedAt: now,
          });

          continue;
        }

        const isAlreadyRevoked =
          existingObjectPermission.canReadObjectRecords === false &&
          existingObjectPermission.canCreateObjectRecords === false &&
          existingObjectPermission.canUpdateObjectRecords === false &&
          existingObjectPermission.canSoftDeleteObjectRecords === false &&
          existingObjectPermission.canDestroyObjectRecords === false;

        if (!isAlreadyRevoked) {
          operations.flatEntityToUpdate.push({
            universalIdentifier: existingObjectPermission.universalIdentifier,
            applicationUniversalIdentifier:
              existingObjectPermission.applicationUniversalIdentifier,
            roleUniversalIdentifier,
            objectMetadataUniversalIdentifier,
            ...NO_RECORDS_PERMISSIONS,
            createdAt: existingObjectPermission.createdAt,
            updatedAt: now,
          });
        }
      }

      for (const {
        objectUniversalIdentifier,
        channelRecordFieldUniversalIdentifier,
        ruleUniversalIdentifierSeed,
        recordsFollowingAChannelRecord,
      } of OBJECTS_FOLLOWING_A_CHANNEL_RECORD) {
        const flatObjectMetadata =
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ];

        if (!isDefined(flatObjectMetadata)) {
          continue;
        }

        const recordsPermissions =
          rolesPermissions[roleId]?.objects[flatObjectMetadata.id];

        if (!recordsPermissions?.canReadAllRecords) {
          continue;
        }

        const hasObjectPermission = existingObjectPermissions.some(
          (objectPermission) =>
            objectPermission.roleUniversalIdentifier ===
              roleUniversalIdentifier &&
            objectPermission.objectMetadataUniversalIdentifier ===
              objectUniversalIdentifier,
        );

        if (
          hasObjectPermission ||
          isDefined(recordsPermissions.rowLevelRecordsPermissions)
        ) {
          this.logger.warn(
            `Workspace ${workspaceId}: role ${label} keeps its own ${flatObjectMetadata.nameSingular} settings, so it may still read ${recordsFollowingAChannelRecord}`,
          );

          continue;
        }

        const buildUniversalIdentifier = (
          kind: 'rule' | 'group' | 'predicate',
        ) =>
          getChannelRecordRuleUniversalIdentifier({
            ruleUniversalIdentifierSeed,
            roleUniversalIdentifier,
            kind,
          });
        const { objectPermissions, rules, predicateGroups, predicates } =
          fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow({
            roleManifest: {
              universalIdentifier: roleUniversalIdentifier,
              label,
              recordsPermissions: {
                objects: [
                  {
                    objectUniversalIdentifier,
                    canReadAllRecords: false,
                    canCreateAllRecords: false,
                    canUpdateAllRecords: false,
                    canSoftDeleteAllRecords: false,
                    canDestroyAllRecords: false,
                    rowLevelRecordsPermissions: [
                      {
                        universalIdentifier: buildUniversalIdentifier('rule'),
                        canReadRecords: true,
                        canCreateRecords:
                          recordsPermissions.canCreateAllRecords,
                        canUpdateRecords:
                          recordsPermissions.canUpdateAllRecords,
                        canSoftDeleteRecords:
                          recordsPermissions.canSoftDeleteAllRecords,
                        canDestroyRecords:
                          recordsPermissions.canDestroyAllRecords,
                        predicateGroups: [
                          {
                            universalIdentifier:
                              buildUniversalIdentifier('group'),
                            logicalOperator:
                              RowLevelPermissionPredicateGroupLogicalOperator.AND,
                            predicates: [
                              {
                                universalIdentifier:
                                  buildUniversalIdentifier('predicate'),
                                fieldUniversalIdentifier:
                                  channelRecordFieldUniversalIdentifier,
                                operand:
                                  RowLevelPermissionPredicateOperand.IS_EMPTY,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
            applicationUniversalIdentifier,
            now,
          });

        operations.flatEntityToCreate.push(...objectPermissions);
        operations.rulesToCreate.push(...rules);
        operations.predicateGroupsToCreate.push(...predicateGroups);
        operations.predicatesToCreate.push(...predicates);
      }
    }

    for (const [
      applicationUniversalIdentifier,
      {
        flatEntityToCreate,
        flatEntityToUpdate,
        rulesToCreate,
        predicateGroupsToCreate,
        predicatesToCreate,
      },
    ] of operationsByApplicationUniversalIdentifier) {
      if (flatEntityToCreate.length === 0 && flatEntityToUpdate.length === 0) {
        continue;
      }

      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: revoking role wide access to channel objects for application ${applicationUniversalIdentifier} (${flatEntityToCreate.length} object permissions to create, ${flatEntityToUpdate.length} to update)`,
      );

      if (isDryRun) {
        continue;
      }

      const migrationArgs = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          objectPermission: {
            flatEntityToCreate,
            flatEntityToUpdate,
            flatEntityToDelete: [],
          },
          rowLevelPermissionRule: {
            flatEntityToCreate: rulesToCreate,
            flatEntityToUpdate: [],
            flatEntityToDelete: [],
          },
          rowLevelPermissionPredicateGroup: {
            flatEntityToCreate: predicateGroupsToCreate,
            flatEntityToUpdate: [],
            flatEntityToDelete: [],
          },
          rowLevelPermissionPredicate: {
            flatEntityToCreate: predicatesToCreate,
            flatEntityToUpdate: [],
            flatEntityToDelete: [],
          },
        },
      };
      const result = await this.validateBuildAndRunMigration({
        migrationArgs,
        isTwentyStandardApplication:
          applicationUniversalIdentifier ===
          twentyStandardFlatApplication.universalIdentifier,
      });

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to revoke role wide access to channel objects for workspace ${workspaceId}`,
        );
      }
    }

    if (!isDryRun) {
      await this.channelVisibilityRuleSyncSchedulerService.scheduleSync(
        workspaceId,
      );
    }
  }

  private async validateBuildAndRunMigration({
    migrationArgs,
    isTwentyStandardApplication,
  }: {
    migrationArgs: Parameters<
      WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunWorkspaceMigration']
    >[0];
    isTwentyStandardApplication: boolean;
  }) {
    if (isTwentyStandardApplication) {
      return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        migrationArgs,
      );
    }

    return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      migrationArgs,
    );
  }
}
