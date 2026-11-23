import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectPermissionMaps } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRowLevelPermissionRuleMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule-maps.type';
import { CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-object-universal-identifiers.constant';
import { getRevokedChannelObjectPermissionUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-revoked-channel-object-permission-universal-identifier.util';
import { getAttachmentNotOfMessageUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-attachment-not-of-message-universal-identifier.util';
import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export type ApiKeyExemptionMetadataMaps = {
  flatRoleMaps: FlatEntityMaps<FlatRole>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatRowLevelPermissionRuleMaps: FlatRowLevelPermissionRuleMaps;
  flatObjectPermissionMaps: FlatObjectPermissionMaps;
};

const isWithoutAnyAccess = (
  objectRecordsPermissions: ObjectRecordsPermissions | undefined,
): boolean =>
  isDefined(objectRecordsPermissions) &&
  !objectRecordsPermissions.canReadAllRecords &&
  !objectRecordsPermissions.canCreateAllRecords &&
  !objectRecordsPermissions.canUpdateAllRecords &&
  !objectRecordsPermissions.canSoftDeleteAllRecords &&
  !objectRecordsPermissions.canDestroyAllRecords &&
  !isNonEmptyArray(objectRecordsPermissions.rowLevelRecordsPermissions);

const buildApiKeyExemptRoleRecordsPermissions = ({
  roleRecordsPermissions,
  flatRole,
  flatObjectMetadataMaps,
  flatRowLevelPermissionRuleMaps,
  flatObjectPermissionMaps,
}: Omit<ApiKeyExemptionMetadataMaps, 'flatRoleMaps'> & {
  roleRecordsPermissions: RoleRecordsPermissions;
  flatRole: Pick<
    FlatRole,
    | 'universalIdentifier'
    | 'canCreateAllObjectRecords'
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
}): RoleRecordsPermissions => {
  const isRevokedByCommand = (flatObjectMetadata: FlatObjectMetadata) =>
    isDefined(
      flatObjectPermissionMaps.byUniversalIdentifier[
        getRevokedChannelObjectPermissionUniversalIdentifier({
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          roleUniversalIdentifier: flatRole.universalIdentifier,
        })
      ],
    ) &&
    isWithoutAnyAccess(roleRecordsPermissions.objects[flatObjectMetadata.id]);
  const isAttachmentRevoked = isDefined(
    flatRowLevelPermissionRuleMaps.byUniversalIdentifier[
      getAttachmentNotOfMessageUniversalIdentifier({
        kind: 'rule',
        roleUniversalIdentifier: flatRole.universalIdentifier,
      })
    ],
  );
  const revokedFlatObjectMetadatas = [
    ...CHANNEL_OBJECT_UNIVERSAL_IDENTIFIERS,
    STANDARD_OBJECTS.attachment.universalIdentifier,
  ]
    .map(
      (objectUniversalIdentifier) =>
        flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier],
    )
    .filter(isDefined)
    .filter((flatObjectMetadata) =>
      flatObjectMetadata.universalIdentifier ===
      STANDARD_OBJECTS.attachment.universalIdentifier
        ? isAttachmentRevoked
        : isRevokedByCommand(flatObjectMetadata),
    );

  if (!isNonEmptyArray(revokedFlatObjectMetadatas)) {
    return roleRecordsPermissions;
  }

  const { objects: roleWideObjects } = computeRoleRecordsPermissions({
    roleDefinition: {
      canCreateAllObjectRecords: flatRole.canCreateAllObjectRecords,
      canReadAllObjectRecords: flatRole.canReadAllObjectRecords,
      canUpdateAllObjectRecords: flatRole.canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: flatRole.canSoftDeleteAllObjectRecords,
      canDestroyAllObjectRecords: flatRole.canDestroyAllObjectRecords,
      isPermissionFlagGranted: () => false,
      objectPermissions: [],
      fieldPermissions: [],
      rowLevelPermissionRules: [],
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
    objectMetadataCollection: revokedFlatObjectMetadatas,
    resolveMorphRelationPermissionFieldIds: () => [],
  });

  return {
    ...roleRecordsPermissions,
    objects: { ...roleRecordsPermissions.objects, ...roleWideObjects },
  };
};

export const buildApiKeyExemptRolesPermissions = ({
  rolesPermissions,
  roleIds,
  flatRoleMaps,
  ...metadataMaps
}: ApiKeyExemptionMetadataMaps & {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  roleIds: string[];
}): Record<string, RoleRecordsPermissions> =>
  roleIds.reduce<Record<string, RoleRecordsPermissions>>(
    (apiKeyRolesPermissions, roleId) => {
      const roleRecordsPermissions = rolesPermissions[roleId];
      const flatRole = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: roleId,
        flatEntityMaps: flatRoleMaps,
      });

      if (!isDefined(roleRecordsPermissions) || !isDefined(flatRole)) {
        return apiKeyRolesPermissions;
      }

      return {
        ...apiKeyRolesPermissions,
        [roleId]: buildApiKeyExemptRoleRecordsPermissions({
          roleRecordsPermissions,
          flatRole,
          ...metadataMaps,
        }),
      };
    },
    { ...rolesPermissions },
  );
