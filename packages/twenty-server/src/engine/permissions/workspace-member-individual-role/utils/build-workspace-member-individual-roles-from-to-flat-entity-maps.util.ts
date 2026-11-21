import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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
  'rowLevelPermissionRule',
  'rowLevelPermissionPredicateGroup',
  'rowLevelPermissionPredicate',
  'fieldPermission',
] as const;

type WorkspaceMemberIndividualRoleFlatEntityMapsKey =
  MetadataToFlatEntityMapsKey<
    (typeof WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES)[number]
  >;

type WorkspaceMemberIndividualRoleUniversalFlatEntityMaps = Pick<
  AllUniversalFlatEntityMaps,
  WorkspaceMemberIndividualRoleFlatEntityMapsKey
>;

const toUniversalFlatEntityMaps = <
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

// From is every stored individual role with its rules, to is the roles the members should hold: the builder diffs them
export const buildWorkspaceMemberIndividualRolesFromToFlatEntityMaps = ({
  individualRoles,
  flatEntityMaps,
  workspaceCustomApplicationUniversalIdentifier,
  now,
}: {
  individualRoles: WorkspaceMemberIndividualRole[];
  flatEntityMaps: Pick<
    AllFlatEntityMaps,
    | WorkspaceMemberIndividualRoleFlatEntityMapsKey
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
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
  const existingFlatRoleTargets = findEntitiesOfRoles({
    flatEntityMaps: flatEntityMaps.flatRoleTargetMaps,
    roleUniversalIdentifiers: existingRoleUniversalIdentifiers,
  });

  const from: WorkspaceMemberIndividualRoleUniversalFlatEntityMaps = {
    flatRoleMaps: toUniversalFlatEntityMaps(existingFlatRoles),
    flatRoleTargetMaps: toUniversalFlatEntityMaps(existingFlatRoleTargets),
    flatRowLevelPermissionRuleMaps: toUniversalFlatEntityMaps(
      findEntitiesOfRoles({
        flatEntityMaps: flatEntityMaps.flatRowLevelPermissionRuleMaps,
        roleUniversalIdentifiers: existingRoleUniversalIdentifiers,
      }),
    ),
    flatRowLevelPermissionPredicateGroupMaps: toUniversalFlatEntityMaps(
      findEntitiesOfRoles({
        flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
        roleUniversalIdentifiers: existingRoleUniversalIdentifiers,
      }),
    ),
    flatRowLevelPermissionPredicateMaps: toUniversalFlatEntityMaps(
      findEntitiesOfRoles({
        flatEntityMaps: flatEntityMaps.flatRowLevelPermissionPredicateMaps,
        roleUniversalIdentifiers: existingRoleUniversalIdentifiers,
      }),
    ),
    flatFieldPermissionMaps: toUniversalFlatEntityMaps(
      findEntitiesOfRoles({
        flatEntityMaps: flatEntityMaps.flatFieldPermissionMaps,
        roleUniversalIdentifiers: existingRoleUniversalIdentifiers,
      }),
    ),
  };

  const findObjectUniversalIdentifier = (objectMetadataId: string) =>
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatEntityMaps.flatObjectMetadataMaps,
    }).universalIdentifier;
  const findFieldUniversalIdentifier = (fieldMetadataId: string) =>
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatEntityMaps.flatFieldMetadataMaps,
    }).universalIdentifier;

  const desiredEntities = individualRoles.map(({ userWorkspaceId, rules }) => {
    const roleUniversalIdentifier =
      getWorkspaceMemberIndividualRoleUniversalIdentifier(userWorkspaceId);
    const owner = {
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
      roleUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
    const roleTargetUniversalIdentifier =
      existingFlatRoleTargets.find(
        (flatRoleTarget) =>
          flatRoleTarget.roleUniversalIdentifier === roleUniversalIdentifier &&
          flatRoleTarget.userWorkspaceId === userWorkspaceId,
      )?.universalIdentifier ??
      v5(
        `${roleUniversalIdentifier}:roleTarget`,
        WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
      );

    const ruleEntities = rules.map((rule) => {
      const buildUniversalIdentifier = (kind: string) =>
        v5(
          `${roleUniversalIdentifier}:${rule.ruleKey}:${kind}`,
          WORKSPACE_MEMBER_INDIVIDUAL_ROLE_UNIVERSAL_IDENTIFIER_NAMESPACE,
        );
      const ruleUniversalIdentifier = buildUniversalIdentifier('rule');
      const groupUniversalIdentifier = buildUniversalIdentifier('group');
      const objectMetadataUniversalIdentifier = findObjectUniversalIdentifier(
        rule.objectMetadataId,
      );
      const operations = {
        canReadRecords: true,
        canCreateRecords: false,
        canUpdateRecords: false,
        canSoftDeleteRecords: false,
        canDestroyRecords: false,
      };

      return {
        rule: {
          ...owner,
          ...operations,
          universalIdentifier: ruleUniversalIdentifier,
          objectMetadataUniversalIdentifier,
        },
        group: {
          ...owner,
          ...operations,
          universalIdentifier: groupUniversalIdentifier,
          objectMetadataUniversalIdentifier,
          rowLevelPermissionRuleUniversalIdentifier: ruleUniversalIdentifier,
          parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          positionInRowLevelPermissionPredicateGroup: null,
          deletedAt: null,
          childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
          rowLevelPermissionPredicateUniversalIdentifiers: [],
        },
        predicate: {
          ...owner,
          universalIdentifier: buildUniversalIdentifier('predicate'),
          objectMetadataUniversalIdentifier,
          fieldMetadataUniversalIdentifier: findFieldUniversalIdentifier(
            rule.fieldMetadataId,
          ),
          relationFieldMetadataUniversalIdentifier: isDefined(
            rule.relationFieldMetadataId,
          )
            ? findFieldUniversalIdentifier(rule.relationFieldMetadataId)
            : null,
          operand: rule.operand,
          value: rule.value,
          subFieldName: null,
          workspaceMemberFieldMetadataUniversalIdentifier: null,
          workspaceMemberSubFieldName: null,
          rowLevelPermissionPredicateGroupUniversalIdentifier:
            groupUniversalIdentifier,
          rowLevelPermissionRuleUniversalIdentifier: ruleUniversalIdentifier,
          positionInRowLevelPermissionPredicateGroup: null,
          deletedAt: null,
        },
        fieldPermissions: rule.unreadableFieldMetadataIds.map(
          (fieldMetadataId) => ({
            ...owner,
            universalIdentifier: buildUniversalIdentifier(
              `field:${fieldMetadataId}`,
            ),
            objectMetadataUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              findFieldUniversalIdentifier(fieldMetadataId),
            rowLevelPermissionPredicateGroupUniversalIdentifier:
              groupUniversalIdentifier,
            rowLevelPermissionRuleUniversalIdentifier: ruleUniversalIdentifier,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          }),
        ),
      };
    });

    return {
      role: {
        universalIdentifier: roleUniversalIdentifier,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
        label: `${WORKSPACE_MEMBER_INDIVIDUAL_ROLE_LABEL_PREFIX}${userWorkspaceId}`,
        description: 'Channel visibility of one workspace member',
        icon: 'IconLock',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canAccessAllAgentChatChannels: false,
        canReadAllObjectRecords: false,
        canCreateAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        isEditable: false,
        isSystemSideEffect: true,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
        canBeAssignedToApplications: false,
        roleTargetUniversalIdentifiers: [],
        objectPermissionUniversalIdentifiers: [],
        fieldPermissionUniversalIdentifiers: [],
        rowLevelPermissionRuleUniversalIdentifiers: [],
        rolePermissionFlagUniversalIdentifiers: [],
        rowLevelPermissionPredicateUniversalIdentifiers: [],
        rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
        agentChatChannelRoleUniversalIdentifiers: [],
        createdAt: findCreatedAt({
          entities: existingFlatRoles,
          universalIdentifier: roleUniversalIdentifier,
          now,
        }),
        updatedAt: now,
      },
      roleTarget: {
        ...owner,
        universalIdentifier: roleTargetUniversalIdentifier,
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
      },
      ruleEntities,
    };
  });

  const ruleEntities = desiredEntities.flatMap(
    ({ ruleEntities }) => ruleEntities,
  );
  const to: WorkspaceMemberIndividualRoleUniversalFlatEntityMaps = {
    flatRoleMaps: toUniversalFlatEntityMaps(
      desiredEntities.map(({ role }) => role),
    ),
    flatRoleTargetMaps: toUniversalFlatEntityMaps(
      desiredEntities.map(({ roleTarget }) => roleTarget),
    ),
    flatRowLevelPermissionRuleMaps: toUniversalFlatEntityMaps(
      ruleEntities.map(({ rule }) => rule),
    ),
    flatRowLevelPermissionPredicateGroupMaps: toUniversalFlatEntityMaps(
      ruleEntities.map(({ group }) => group),
    ),
    flatRowLevelPermissionPredicateMaps: toUniversalFlatEntityMaps(
      ruleEntities.map(({ predicate }) => predicate),
    ),
    flatFieldPermissionMaps: toUniversalFlatEntityMaps(
      ruleEntities.flatMap(({ fieldPermissions }) => fieldPermissions),
    ),
  };

  return {
    flatRoleMaps: { from: from.flatRoleMaps, to: to.flatRoleMaps },
    flatRoleTargetMaps: {
      from: from.flatRoleTargetMaps,
      to: to.flatRoleTargetMaps,
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
    flatFieldPermissionMaps: {
      from: from.flatFieldPermissionMaps,
      to: to.flatFieldPermissionMaps,
    },
  };
};
