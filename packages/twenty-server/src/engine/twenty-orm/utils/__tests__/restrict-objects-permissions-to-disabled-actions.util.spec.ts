import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';
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

const buildFlatObjectMetadataMaps = (
  disabledObjectPermissionActions: FlatObjectMetadata['disabledObjectPermissionActions'],
): FlatEntityMaps<FlatObjectMetadata> => {
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();

  flatObjectMetadataMaps.byUniversalIdentifier['invoice-universal-identifier'] =
    getFlatObjectMetadataMock({
      id: INVOICE_ID,
      universalIdentifier: 'invoice-universal-identifier',
      applicationId: OWNING_APPLICATION_ID,
      disabledObjectPermissionActions,
    });
  flatObjectMetadataMaps.universalIdentifierById[INVOICE_ID] =
    'invoice-universal-identifier';

  return flatObjectMetadataMaps;
};

const OWNING_APPLICATION_ROLE_ID = 'owning-application-role-id';

const FLAT_APPLICATION_MAPS: ApplicationDefaultRoleMaps = {
  byId: {
    [OWNING_APPLICATION_ID]: {
      defaultRoleId: OWNING_APPLICATION_ROLE_ID,
      deletedAt: null,
    },
  },
};

const restrict = (applicationRoleId: string | undefined) =>
  restrictObjectsPermissionsToDisabledActions({
    objectsPermissions: { [INVOICE_ID]: FULL_ACCESS },
    flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
      'canDestroyObjectRecords',
    ]),
    flatApplicationMaps: FLAT_APPLICATION_MAPS,
    applicationRoleId,
  });

describe('restrictObjectsPermissionsToDisabledActions', () => {
  it.each([undefined, 'other-application-role-id'])(
    'should turn off disabled actions for application role %s',
    (applicationRoleId) => {
      expect(restrict(applicationRoleId)[INVOICE_ID]).toEqual({
        ...FULL_ACCESS,
        canDestroyObjectRecords: false,
      });
    },
  );

  it('should keep disabled actions for the role of the application that owns the object', () => {
    expect(restrict(OWNING_APPLICATION_ROLE_ID)[INVOICE_ID]).toBe(FULL_ACCESS);
  });

  it('should return the same permissions when nothing is disabled', () => {
    const objectsPermissions = { [INVOICE_ID]: FULL_ACCESS };

    expect(
      restrictObjectsPermissionsToDisabledActions({
        objectsPermissions,
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(null),
        flatApplicationMaps: FLAT_APPLICATION_MAPS,
        applicationRoleId: undefined,
      }),
    ).toBe(objectsPermissions);
  });
});
