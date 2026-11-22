import { Command } from 'nest-commander';
import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-records-permissions.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
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

const { attachment } = STANDARD_OBJECTS;

const NO_RECORDS_PERMISSIONS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

// TODO(@charlesBochet): delete this command once channel visibility is enforced through individual roles everywhere
@Command({
  name: 'channel-visibility:revoke-role-wide-access',
  description:
    'Revoke the role wide access of user roles to message and calendar objects, and to message attachments, in workspaces enforcing channel visibility through individual roles',
})
export class RevokeRoleWideAccessToChannelObjectsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      featureFlagsMap,
      flatRoleMaps,
      flatObjectPermissionMaps,
      flatObjectMetadataMaps,
      rolesPermissions,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'rolesPermissions',
      'flatRoleMaps',
      'flatObjectPermissionMaps',
      'flatObjectMetadataMaps',
    ]);

    if (!isChannelVisibilityRlsEnabled(featureFlagsMap)) {
      return;
    }

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

    const attachmentFlatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        attachment.universalIdentifier
      ];

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

      const attachmentRecordsPermissions = isDefined(
        attachmentFlatObjectMetadata,
      )
        ? rolesPermissions[roleId]?.objects[attachmentFlatObjectMetadata.id]
        : undefined;
      const hasAttachmentObjectPermission = existingObjectPermissions.some(
        (objectPermission) =>
          objectPermission.roleUniversalIdentifier ===
            roleUniversalIdentifier &&
          objectPermission.objectMetadataUniversalIdentifier ===
            attachment.universalIdentifier,
      );

      const hasOwnAttachmentSettings =
        hasAttachmentObjectPermission ||
        isDefined(attachmentRecordsPermissions?.rowLevelRecordsPermissions);

      if (
        attachmentRecordsPermissions?.canReadAllRecords &&
        hasOwnAttachmentSettings
      ) {
        this.logger.warn(
          `Workspace ${workspaceId}: role ${label} keeps its own attachment settings, so it may still read message attachments`,
        );
      }

      if (
        attachmentRecordsPermissions?.canReadAllRecords &&
        !hasOwnAttachmentSettings
      ) {
        const buildUniversalIdentifier = (kind: string) =>
          v5(`attachmentNotOfMessage:${kind}`, roleUniversalIdentifier);
        const { objectPermissions, rules, predicateGroups, predicates } =
          fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow({
            roleManifest: {
              universalIdentifier: roleUniversalIdentifier,
              label,
              recordsPermissions: {
                objects: [
                  {
                    objectUniversalIdentifier: attachment.universalIdentifier,
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
                          attachmentRecordsPermissions.canCreateAllRecords,
                        canUpdateRecords:
                          attachmentRecordsPermissions.canUpdateAllRecords,
                        canSoftDeleteRecords:
                          attachmentRecordsPermissions.canSoftDeleteAllRecords,
                        canDestroyRecords:
                          attachmentRecordsPermissions.canDestroyAllRecords,
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
                                  attachment.fields.targetMessage
                                    .universalIdentifier,
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
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: revoking role wide access to channel objects for application ${applicationUniversalIdentifier} (${flatEntityToCreate.length} object permissions to create, ${flatEntityToUpdate.length} to update)`,
      );

      if (options.dryRun) {
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
      const result =
        applicationUniversalIdentifier ===
        twentyStandardFlatApplication.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to revoke role wide access to channel objects for workspace ${workspaceId}`,
        );
      }
    }
  }
}
