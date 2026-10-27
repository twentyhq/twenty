import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';

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

const restrict = ({
  roleSource,
  roleApplicationId,
}: {
  roleSource: keyof RoleIdsBySource;
  roleApplicationId: string;
}) =>
  restrictObjectsPermissionsToDisabledActions({
    objectsPermissions: { [INVOICE_ID]: FULL_ACCESS },
    flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
      'canDestroyObjectRecords',
    ]),
    roleSource,
    flatRole: { applicationId: roleApplicationId },
  });

describe('restrictObjectsPermissionsToDisabledActions', () => {
  it.each([
    {
      roleSource: 'userWorkspaceRoleId',
      roleApplicationId: OWNING_APPLICATION_ID,
    },
    { roleSource: 'apiKeyRoleId', roleApplicationId: OWNING_APPLICATION_ID },
    { roleSource: 'agentRoleId', roleApplicationId: OWNING_APPLICATION_ID },
    {
      roleSource: 'applicationRoleId',
      roleApplicationId: 'other-application-id',
    },
  ] as const)('should turn off disabled actions for %o', (role) => {
    expect(restrict(role)[INVOICE_ID]).toEqual({
      ...FULL_ACCESS,
      canDestroyObjectRecords: false,
    });
  });

  it('should keep disabled actions for the role of the application that owns the object', () => {
    expect(
      restrict({
        roleSource: 'applicationRoleId',
        roleApplicationId: OWNING_APPLICATION_ID,
      })[INVOICE_ID],
    ).toBe(FULL_ACCESS);
  });

  it('should restrict an application role that cannot be found', () => {
    expect(
      restrictObjectsPermissionsToDisabledActions({
        objectsPermissions: { [INVOICE_ID]: FULL_ACCESS },
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          'canDestroyObjectRecords',
        ]),
        roleSource: 'applicationRoleId',
        flatRole: undefined,
      })[INVOICE_ID]?.canDestroyObjectRecords,
    ).toBe(false);
  });

  it('should return the same permissions when nothing is disabled', () => {
    const objectsPermissions = { [INVOICE_ID]: FULL_ACCESS };

    expect(
      restrictObjectsPermissionsToDisabledActions({
        objectsPermissions,
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(null),
        roleSource: 'userWorkspaceRoleId',
        flatRole: { applicationId: OWNING_APPLICATION_ID },
      }),
    ).toBe(objectsPermissions);
  });
});
