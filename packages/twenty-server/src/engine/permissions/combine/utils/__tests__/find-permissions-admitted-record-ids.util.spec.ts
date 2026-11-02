/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import {
  type RowAccessEvaluationContext,
  type RowAccessPolicySubject,
  type RowAccessRecord,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';

const MEMBER_ID = 'member-1';

const statusField = getFlatFieldMetadataMock({
  objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.TEXT,
  name: 'status',
  universalIdentifier: 'company-status-field-universal-id',
});
const createdByField = getFlatFieldMetadataMock({
  objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.ACTOR,
  name: 'createdBy',
  universalIdentifier: 'company-created-by-field-universal-id',
});

const flatObjectMetadata = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  isSystem: false,
  fieldIds: [statusField.id, createdByField.id],
};

const emptyFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();
const flatFieldMetadataMaps = [statusField, createdByField].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  emptyFlatFieldMetadataMaps,
);

const records: RowAccessRecord[] = [
  { id: 'active-shared', status: 'active', deletedAt: null },
  { id: 'active-private', status: 'active', deletedAt: null },
  { id: 'archived-shared', status: 'archived', deletedAt: null },
];

const recordShares: RecordShareGrant[] = [
  {
    recordId: 'active-shared',
    principalId: MEMBER_ID,
    accessLevel: RecordShareAccessLevel.READ,
  },
  {
    recordId: 'archived-shared',
    principalId: MEMBER_ID,
    accessLevel: RecordShareAccessLevel.READ_WRITE,
  },
  {
    recordId: 'active-private',
    principalId: EVERYONE_PRINCIPAL_ID,
    accessLevel: RecordShareAccessLevel.READ,
  },
];

const privateRecordStates = new Map<string, PrivateRecordState>([
  ['active-shared', { isPrivate: false, createdByWorkspaceMemberId: null }],
  [
    'active-private',
    { isPrivate: true, createdByWorkspaceMemberId: MEMBER_ID },
  ],
]);

const roleSubject: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
  workspaceMemberId: undefined,
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

const withStatusFilter = (status: string): RowAccessPolicySubject => ({
  ...roleSubject,
  resolveRowLevelPermissionRecordFilter: () => ({ status: { eq: status } }),
});

const buildContext = (): RowAccessEvaluationContext => ({
  shouldIgnoreSoftDeleteDefaultFilter: false,
  fetchRecordShares: jest.fn(async ({ recordIds }) =>
    recordShares.filter((recordShare) =>
      recordIds.includes(recordShare.recordId),
    ),
  ),
  findPrivateRecordStates: jest.fn(async () => privateRecordStates),
});

const findAdmitted = ({
  subject,
  featureFlagKeys = [FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED],
  context = buildContext(),
}: {
  subject: RowAccessPolicySubject;
  featureFlagKeys?: FeatureFlagKey[];
  context?: RowAccessEvaluationContext;
}) =>
  findPermissionsAdmittedRecordIds({
    subject,
    environment: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      featureFlagsMap: Object.fromEntries(
        featureFlagKeys.map((featureFlagKey) => [featureFlagKey, true]),
      ),
    },
    flatObjectMetadata,
    operationType: 'select',
    records,
    context,
  });

describe('findPermissionsAdmittedRecordIds', () => {
  it('admits every record to the system and none to a role without access', async () => {
    expect(
      await findAdmitted({
        subject: { ...roleSubject, isSystemContext: true },
      }),
    ).toEqual(new Set(records.map((record) => record.id)));
    expect(
      await findAdmitted({
        subject: { ...roleSubject, objectsPermissions: {} },
      }),
    ).toEqual(new Set());
  });

  it('keeps the role to public records, treating a record it cannot find as public', async () => {
    expect(await findAdmitted({ subject: roleSubject })).toEqual(
      new Set(['active-shared', 'archived-shared']),
    );
  });

  it('matches the role filter on public record values', async () => {
    expect(await findAdmitted({ subject: withStatusFilter('active') })).toEqual(
      new Set(['active-shared']),
    );
  });

  it('admits records shared with the member beyond the role, ignoring shares with everyone', async () => {
    expect(
      await findAdmitted({
        subject: { ...roleSubject, objectsPermissions: {} },
        featureFlagKeys: [
          FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
          FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        ],
      }),
    ).toEqual(new Set(['active-shared', 'archived-shared']));
  });

  it('admits private records to their creator within the role filter', async () => {
    expect(
      await findAdmitted({
        subject: {
          ...roleSubject,
          principalIds: [EVERYONE_PRINCIPAL_ID],
          workspaceMemberId: MEMBER_ID,
          resolveRowLevelPermissionRecordFilter: () => ({
            status: { eq: 'none' },
          }),
        },
      }),
    ).toEqual(new Set());
    expect(
      await findAdmitted({
        subject: {
          ...withStatusFilter('active'),
          principalIds: [EVERYONE_PRINCIPAL_ID],
          workspaceMemberId: MEMBER_ID,
        },
      }),
    ).toEqual(new Set(['active-shared', 'active-private']));
  });

  it('only asks shares about records the role did not admit', async () => {
    const context = buildContext();

    expect(
      await findAdmitted({
        subject: withStatusFilter('active'),
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
        context,
      }),
    ).toEqual(new Set(records.map((record) => record.id)));
    expect(context.findPrivateRecordStates).not.toHaveBeenCalled();
    expect(context.fetchRecordShares).toHaveBeenCalledWith({
      objectMetadataId: flatObjectMetadata.id,
      recordIds: ['archived-shared'],
    });
  });
});
