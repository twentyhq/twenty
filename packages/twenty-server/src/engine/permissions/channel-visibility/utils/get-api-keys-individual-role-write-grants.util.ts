import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type ApiKeysIndividualRoleWriteGrants } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';

export const getApiKeysIndividualRoleWriteGrants = ({
  flatRole,
}: {
  flatRole: ApiKeysIndividualRoleWriteGrants;
}): ApiKeysIndividualRoleWriteGrants => ({
  canCreateAllObjectRecords: flatRole.canCreateAllObjectRecords,
  canUpdateAllObjectRecords: flatRole.canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords: flatRole.canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords: flatRole.canDestroyAllObjectRecords,
});

export const isRoleRevokedForApiKeys = ({
  flatRole,
}: {
  flatRole: Pick<
    FlatRole,
    'canBeAssignedToUsers' | 'canReadAllObjectRecords' | 'isSystemSideEffect'
  >;
}): boolean =>
  flatRole.canBeAssignedToUsers &&
  flatRole.canReadAllObjectRecords &&
  !flatRole.isSystemSideEffect;
