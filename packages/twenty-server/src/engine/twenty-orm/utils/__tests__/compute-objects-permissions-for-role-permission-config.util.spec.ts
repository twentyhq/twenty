import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';

const INVOICE_ID = 'invoice-id';
const OWNING_APPLICATION_ID = 'owning-application-id';

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

flatObjectMetadataMaps.byUniversalIdentifier['invoice-universal-identifier'] =
  getFlatObjectMetadataMock({
    id: INVOICE_ID,
    universalIdentifier: 'invoice-universal-identifier',
    applicationId: OWNING_APPLICATION_ID,
    disabledObjectPermissionActions: ['canDestroyObjectRecords'],
  });
flatObjectMetadataMaps.universalIdentifierById[INVOICE_ID] =
  'invoice-universal-identifier';

const rolesPermissions = {
  'user-role-id': { [INVOICE_ID]: FULL_ACCESS },
  'application-role-id': { [INVOICE_ID]: FULL_ACCESS },
};

const flatRoleMaps: FlatRoleMaps = createEmptyFlatEntityMaps();

for (const [roleId, applicationId] of [
  ['user-role-id', OWNING_APPLICATION_ID],
  ['application-role-id', OWNING_APPLICATION_ID],
]) {
  flatRoleMaps.byUniversalIdentifier[`${roleId}-universal-identifier`] = {
    id: roleId,
    applicationId,
  } as FlatRole;
  flatRoleMaps.universalIdentifierById[roleId] =
    `${roleId}-universal-identifier`;
}

describe('computeObjectsPermissionsForRolePermissionConfig', () => {
  it('should let the owning application alone run a disabled action', () => {
    expect(
      computeObjectsPermissionsForRolePermissionConfig({
        intersectionOf: { applicationRoleId: 'application-role-id' },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatRoleMaps,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(true);
  });

  it('should keep a user acting through the owning application restricted', () => {
    expect(
      computeObjectsPermissionsForRolePermissionConfig({
        intersectionOf: {
          userWorkspaceRoleId: 'user-role-id',
          applicationRoleId: 'application-role-id',
        },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatRoleMaps,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(false);
  });

  it('should restrict a user whose role belongs to the owning application', () => {
    expect(
      computeObjectsPermissionsForRolePermissionConfig({
        intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatRoleMaps,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(false);
  });
});
