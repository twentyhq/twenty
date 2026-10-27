import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';

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

const flatApplicationMaps: ApplicationDefaultRoleMaps = {
  byId: {
    [OWNING_APPLICATION_ID]: {
      defaultRoleId: 'application-role-id',
      deletedAt: null,
    },
  },
};

describe('computeObjectsPermissionsForRolePermissionConfig', () => {
  it('should let the owning application alone run a disabled action', () => {
    expect(
      computeObjectsPermissionsForRolePermissionConfig({
        intersectionOf: { applicationRoleId: 'application-role-id' },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatApplicationMaps,
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
        flatApplicationMaps,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(false);
  });

  it('should restrict a user assigned the owning application role', () => {
    expect(
      computeObjectsPermissionsForRolePermissionConfig({
        intersectionOf: { userWorkspaceRoleId: 'application-role-id' },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatApplicationMaps,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(false);
  });

  it('should keep a user holding the owning application role restricted through that application', () => {
    expect(
      computeObjectsPermissionsForRolePermissionConfig({
        intersectionOf: {
          userWorkspaceRoleId: 'application-role-id',
          applicationRoleId: 'application-role-id',
        },
        rolesPermissions,
        flatObjectMetadataMaps,
        flatApplicationMaps,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(false);
  });
});
