/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  type ObjectPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type RowAccessPolicySubject } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { resolvePermissionsObjectAccessScope } from 'src/engine/permissions/combine/utils/resolve-permissions-object-access-scope.util';
import { type OperationType } from 'src/engine/permissions/role/utils/validate-operation-is-permitted-or-throw.util';

const statusField = getFlatFieldMetadataMock({
  objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.TEXT,
  name: 'status',
  universalIdentifier: 'company-status-field-universal-id',
});

const flatObjectMetadata = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  isSystem: false,
  fieldIds: [statusField.id],
};

const readOnlyPermissions: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const readOnlySubject: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: { [flatObjectMetadata.id]: readOnlyPermissions },
  principalIds: [EVERYONE_PRINCIPAL_ID, 'member-1'],
  workspaceMemberId: 'member-1',
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

const resolveScope = ({
  subject = readOnlySubject,
  operationType = 'select',
  featureFlagKeys = [],
  disabledObjectPermissionActions = [],
}: {
  subject?: RowAccessPolicySubject;
  operationType?: OperationType;
  featureFlagKeys?: FeatureFlagKey[];
  disabledObjectPermissionActions?: typeof flatObjectMetadata.disabledObjectPermissionActions;
}) =>
  resolvePermissionsObjectAccessScope({
    subject,
    environment: {
      flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: statusField,
        flatEntityMaps: createEmptyFlatEntityMaps(),
      }),
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      featureFlagsMap: Object.fromEntries(
        featureFlagKeys.map((featureFlagKey) => [featureFlagKey, true]),
      ),
    },
    flatObjectMetadata: {
      ...flatObjectMetadata,
      disabledObjectPermissionActions,
    },
    operationType,
  });

describe('resolvePermissionsObjectAccessScope', () => {
  it('opens every record to the system and to a role granting them all', () => {
    expect(
      resolveScope({
        subject: { ...readOnlySubject, isSystemContext: true },
        operationType: 'delete',
      }),
    ).toBe('all');
    expect(resolveScope({})).toBe('all');
  });

  it('denies an operation the role lacks when no share can grant it', () => {
    expect(resolveScope({ operationType: 'update' })).toBe('none');
    expect(
      resolveScope({ subject: { ...readOnlySubject, objectsPermissions: {} } }),
    ).toBe('none');
    expect(
      resolveScope({
        operationType: 'delete',
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
      }),
    ).toBe('none');
  });

  it('denies a disabled operation unless the subject owns the object', () => {
    expect(
      resolveScope({
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    ).toBe('none');
    expect(
      resolveScope({
        subject: { ...readOnlySubject, isOwningApplication: () => true },
        disabledObjectPermissionActions: ['canReadObjectRecords'],
      }),
    ).toBe('all');
  });

  it('gates an operation that shares can grant beyond the role', () => {
    expect(
      resolveScope({
        operationType: 'update',
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
      }),
    ).toBe('gated');
  });

  it('gates a role limited by row level permissions or to public records', () => {
    expect(
      resolveScope({
        subject: {
          ...readOnlySubject,
          resolveRowLevelPermissionRecordFilter: () => ({
            status: { eq: 'active' },
          }),
        },
      }),
    ).toBe('gated');
    expect(
      resolveScope({
        featureFlagKeys: [FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED],
      }),
    ).toBe('gated');
  });
});
