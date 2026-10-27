import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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

const restrict = (
  principal: Parameters<
    typeof restrictObjectsPermissionsToDisabledActions
  >[0]['principal'],
  disabledObjectPermissionActions: FlatObjectMetadata['disabledObjectPermissionActions'] = [
    'canDestroyObjectRecords',
  ],
) =>
  restrictObjectsPermissionsToDisabledActions({
    objectsPermissions: { [INVOICE_ID]: FULL_ACCESS },
    flatObjectMetadataMaps: buildFlatObjectMetadataMaps(
      disabledObjectPermissionActions,
    ),
    principal,
  });

describe('restrictObjectsPermissionsToDisabledActions', () => {
  it.each([
    { type: 'userWorkspace', userWorkspaceId: 'user-workspace-id' },
    { type: 'apiKey', apiKeyId: 'api-key-id' },
    { type: 'agent', agentId: 'agent-id' },
    { type: 'application', applicationId: 'other-application-id' },
    undefined,
  ] as const)('should turn off disabled actions for %o', (principal) => {
    expect(restrict(principal)[INVOICE_ID]).toEqual({
      ...FULL_ACCESS,
      canDestroyObjectRecords: false,
    });
  });

  it('should keep disabled actions for the application that owns the object', () => {
    expect(
      restrict({ type: 'application', applicationId: OWNING_APPLICATION_ID })[
        INVOICE_ID
      ],
    ).toBe(FULL_ACCESS);
  });

  it('should return the same permissions when nothing is disabled', () => {
    const objectsPermissions = { [INVOICE_ID]: FULL_ACCESS };

    expect(
      restrictObjectsPermissionsToDisabledActions({
        objectsPermissions,
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(null),
        principal: { type: 'userWorkspace', userWorkspaceId: 'user-id' },
      }),
    ).toBe(objectsPermissions);
  });
});
