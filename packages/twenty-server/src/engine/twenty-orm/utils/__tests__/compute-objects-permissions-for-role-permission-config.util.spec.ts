import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';

const INVOICE_ID = 'invoice-id';

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

flatObjectMetadataMaps.byUniversalIdentifier.invoice =
  getFlatObjectMetadataMock({
    id: INVOICE_ID,
    universalIdentifier: 'invoice',
    applicationId: 'owning-application-id',
    disabledObjectPermissionActions: ['canDestroyObjectRecords'],
  });
flatObjectMetadataMaps.universalIdentifierById[INVOICE_ID] = 'invoice';

const flatApplicationMaps: ApplicationDefaultRoleMaps = {
  byId: {
    'owning-application-id': {
      id: 'owning-application-id',
      defaultRoleId: 'owning-application-role-id',
      deletedAt: null,
    },
    'other-application-id': {
      id: 'other-application-id',
      defaultRoleId: 'other-application-role-id',
      deletedAt: null,
    },
  },
};

const rolesPermissions = Object.fromEntries(
  [
    'user-role-id',
    'owning-application-role-id',
    'other-application-role-id',
  ].map((roleId) => [roleId, { [INVOICE_ID]: FULL_ACCESS }]),
);

describe('computeObjectsPermissionsForRolePermissionConfig', () => {
  it.each<{
    actor: string;
    intersectionOf: RoleIdsBySource;
    canDestroy: boolean;
  }>([
    {
      actor: 'the owning application',
      intersectionOf: { applicationRoleId: 'owning-application-role-id' },
      canDestroy: true,
    },
    {
      actor: 'another application',
      intersectionOf: { applicationRoleId: 'other-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user',
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user through the owning application',
      intersectionOf: {
        userWorkspaceRoleId: 'user-role-id',
        applicationRoleId: 'owning-application-role-id',
      },
      canDestroy: false,
    },
  ])(
    'disabled action allowed for $actor: $canDestroy',
    ({ intersectionOf, canDestroy }) => {
      expect(
        computeObjectsPermissionsForRolePermissionConfig({
          intersectionOf,
          rolesPermissions,
          flatObjectMetadataMaps,
          flatApplicationMaps,
        })[INVOICE_ID]?.canDestroyObjectRecords,
      ).toBe(canDestroy);
    },
  );
});
