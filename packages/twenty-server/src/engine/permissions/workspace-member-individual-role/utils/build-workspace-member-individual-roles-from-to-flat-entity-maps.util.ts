import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-records-permissions.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';
import {
  WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX,
  WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
} from 'src/engine/permissions/workspace-member-individual-role/constants/workspace-member-individual-role.constant';
import { type WorkspaceMemberIndividualRole } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';
import { getWorkspaceMemberIndividualRoleUniversalIdentifier } from 'src/engine/permissions/workspace-member-individual-role/utils/get-workspace-member-individual-role-universal-identifier.util';
import { isWorkspaceMemberIndividualRole } from 'src/engine/permissions/workspace-member-individual-role/utils/is-workspace-member-individual-role.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

export const WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES = [
  'role',
  'roleTarget',
  'objectPermission',
  'fieldPermission',
  'rowLevelPermissionRule',
  'rowLevelPermissionPredicateGroup',
  'rowLevelPermissionPredicate',
] as const;

type WorkspaceMemberIndividualRoleFlatEntityMapsKey =
  MetadataToFlatEntityMapsKey<
    (typeof WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES)[number]
  >;

type WorkspaceMemberIndividualRoleUniversalFlatEntityMaps = Pick<
  AllUniversalFlatEntityMaps,
  WorkspaceMemberIndividualRoleFlatEntityMapsKey
>;

const buildUniversalFlatEntityMaps = <
  TUniversalFlatEntity extends { universalIdentifier: string },
>(
  universalFlatEntities: TUniversalFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalFlatEntities.map((universalFlatEntity) => [
      universalFlatEntity.universalIdentifier,
      universalFlatEntity,
    ]),
  ),
});

const findEntitiesOfRoles = <
  TFlatEntity extends { roleUniversalIdentifier: string },
>({
  flatEntityMaps,
  roleUniversalIdentifiers,
}: {
  flatEntityMaps: {
    byUniversalIdentifier: Partial<Record<string, TFlatEntity>>;
  };
  roleUniversalIdentifiers: Set<string>;
}): TFlatEntity[] =>
  Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(({ roleUniversalIdentifier }) =>
      roleUniversalIdentifiers.has(roleUniversalIdentifier),
    );

const findCreatedAt = ({
  entities,
  universalIdentifier,
  now,
}: {
  entities: { universalIdentifier: string; createdAt: string }[];
  universalIdentifier: string;
  now: string;
}): string =>
  entities.find((entity) => entity.universalIdentifier === universalIdentifier)
    ?.createdAt ?? now;

export const buildWorkspaceMemberIndividualRolesFromToFlatEntityMaps = ({
  individualRoles,
  flatEntityMaps,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  individualRoles: WorkspaceMemberIndividualRole[];
  flatEntityMaps: Pick<
    AllFlatEntityMaps,
    WorkspaceMemberIndividualRoleFlatEntityMapsKey
  >;
  workspaceCustomApplicationUniversalIdentifier: string;
  now: string;
}): FromToAllUniversalFlatEntityMaps => {
  const existingFlatRoles = Object.values(
    flatEntityMaps.flatRoleMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(isWorkspaceMemberIndividualRole);
  const existingRoleUniversalIdentifiers = new Set(
    existingFlatRoles.map(({ universalIdentifier }) => universalIdentifier),
  );
  const findExistingEntities = <
    TFlatEntity extends { roleUniversalIdentifier: string },
  >(existingFlatEntityMaps: {
    byUniversalIdentifier: Partial<Record<string, TFlatEntity>>;
  }) =>
    findEntitiesOfRoles({
      flatEntityMaps: existingFlatEntityMaps,
      roleUniversalIdentifiers: existingRoleUniversalIdentifiers,
    });
  const existingFlatRoleTargets = findExistingEntities(
    flatEntityMaps.flatRoleTargetMaps,
  );

  const from: WorkspaceMemberIndividualRoleUniversalFlatEntityMaps = {
    flatRoleMaps: buildUniversalFlatEntityMaps(existingFlatRoles),
    flatRoleTargetMaps: buildUniversalFlatEntityMaps(existingFlatRoleTargets),
    flatObjectPermissionMaps: buildUniversalFlatEntityMaps(
      findExistingEntities(flatEntityMaps.flatObjectPermissionMaps),
    ),
    flatFieldPermissionMaps: buildUniversalFlatEntityMaps(
      findExistingEntities(flatEntityMaps.flatFieldPermissionMaps),
    ),
    flatRowLevelPermissionRuleMaps: buildUniversalFlatEntityMaps(
      findExistingEntities(flatEntityMaps.flatRowLevelPermissionRuleMaps),
    ),
    flatRowLevelPermissionPredicateGroupMaps: buildUniversalFlatEntityMaps(
      findExistingEntities(
        flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
      ),
    ),
    flatRowLevelPermissionPredicateMaps: buildUniversalFlatEntityMaps(
      findExistingEntities(flatEntityMaps.flatRowLevelPermissionPredicateMaps),
    ),
  };

  const desiredEntities = individualRoles.map(
    ({ userWorkspaceId, recordsPermissions }) => {
      const roleUniversalIdentifier =
        getWorkspaceMemberIndividualRoleUniversalIdentifier(userWorkspaceId);
      const roleManifest: RoleManifest = {
        universalIdentifier: roleUniversalIdentifier,
        label: `${WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX}${userWorkspaceId}`,
        description: 'Permissions of one workspace member',
        icon: 'IconLock',
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
        recordsPermissions,
      };
      const converterArgs = {
        roleManifest,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        now,
      };
      const roleTargetUniversalIdentifier =
        existingFlatRoleTargets.find(
          (flatRoleTarget) =>
            flatRoleTarget.roleUniversalIdentifier ===
              roleUniversalIdentifier &&
            flatRoleTarget.userWorkspaceId === userWorkspaceId,
        )?.universalIdentifier ??
        v5(
          `${roleUniversalIdentifier}:roleTarget`,
          WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        );

      return {
        role: {
          ...fromRoleManifestToUniversalFlatRole(converterArgs),
          isEditable: false,
          isSystemSideEffect: true,
          createdAt: findCreatedAt({
            entities: existingFlatRoles,
            universalIdentifier: roleUniversalIdentifier,
            now,
          }),
        },
        roleTarget: {
          universalIdentifier: roleTargetUniversalIdentifier,
          applicationUniversalIdentifier:
            workspaceCustomApplicationUniversalIdentifier,
          roleUniversalIdentifier,
          isSystemSideEffect: true,
          userWorkspaceId,
          agentUniversalIdentifier: null,
          apiKeyId: null,
          webhookUniversalIdentifier: null,
          targetApplicationUniversalIdentifier: null,
          createdAt: findCreatedAt({
            entities: existingFlatRoleTargets,
            universalIdentifier: roleTargetUniversalIdentifier,
            now,
          }),
          updatedAt: now,
        },
        ...fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow(
          converterArgs,
        ),
      };
    },
  );

  const to: WorkspaceMemberIndividualRoleUniversalFlatEntityMaps = {
    flatRoleMaps: buildUniversalFlatEntityMaps(
      desiredEntities.map(({ role }) => role),
    ),
    flatRoleTargetMaps: buildUniversalFlatEntityMaps(
      desiredEntities.map(({ roleTarget }) => roleTarget),
    ),
    flatObjectPermissionMaps: buildUniversalFlatEntityMaps(
      desiredEntities.flatMap(({ objectPermissions }) => objectPermissions),
    ),
    flatFieldPermissionMaps: buildUniversalFlatEntityMaps(
      desiredEntities.flatMap(({ fieldPermissions }) => fieldPermissions),
    ),
    flatRowLevelPermissionRuleMaps: buildUniversalFlatEntityMaps(
      desiredEntities.flatMap(({ rules }) => rules),
    ),
    flatRowLevelPermissionPredicateGroupMaps: buildUniversalFlatEntityMaps(
      desiredEntities.flatMap(({ predicateGroups }) => predicateGroups),
    ),
    flatRowLevelPermissionPredicateMaps: buildUniversalFlatEntityMaps(
      desiredEntities.flatMap(({ predicates }) => predicates),
    ),
  };

  return {
    flatRoleMaps: { from: from.flatRoleMaps, to: to.flatRoleMaps },
    flatRoleTargetMaps: {
      from: from.flatRoleTargetMaps,
      to: to.flatRoleTargetMaps,
    },
    flatObjectPermissionMaps: {
      from: from.flatObjectPermissionMaps,
      to: to.flatObjectPermissionMaps,
    },
    flatFieldPermissionMaps: {
      from: from.flatFieldPermissionMaps,
      to: to.flatFieldPermissionMaps,
    },
    flatRowLevelPermissionRuleMaps: {
      from: from.flatRowLevelPermissionRuleMaps,
      to: to.flatRowLevelPermissionRuleMaps,
    },
    flatRowLevelPermissionPredicateGroupMaps: {
      from: from.flatRowLevelPermissionPredicateGroupMaps,
      to: to.flatRowLevelPermissionPredicateGroupMaps,
    },
    flatRowLevelPermissionPredicateMaps: {
      from: from.flatRowLevelPermissionPredicateMaps,
      to: to.flatRowLevelPermissionPredicateMaps,
    },
  };
};
