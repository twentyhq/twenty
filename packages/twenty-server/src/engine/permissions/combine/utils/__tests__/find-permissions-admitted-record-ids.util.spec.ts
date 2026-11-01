/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { FieldMetadataType, RecordShareAccessLevel } from 'twenty-shared/types';

import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import {
  findPermissionsAdmittedRecordIds,
  type RowAccessEvaluationContext,
  type RowAccessRecord,
} from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type PermissionsRowAccessGrants } from 'src/engine/permissions/combine/types/row-access-policy.type';

const MEMBER_ID = 'member-1';

const statusField = getFlatFieldMetadataMock({
  objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.TEXT,
  name: 'status',
  universalIdentifier: 'company-status-field-universal-id',
});

const flatObjectMetadata = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  fieldIds: [statusField.id],
};

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: statusField,
  flatEntityMaps:
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
});

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

const noGrants: PermissionsRowAccessGrants = {
  tableAlias: 'company',
  flatObjectMetadata,
  areRoleGrantsLimitedToPublicRecords: true,
  areRecordGrantsHeldToRowLevelPermissions: false,
  isObjectGranted: false,
};

const shareGrant: NonNullable<PermissionsRowAccessGrants['shareGrant']> = {
  principalIds: [MEMBER_ID],
  accessLevels: [
    RecordShareAccessLevel.READ,
    RecordShareAccessLevel.READ_WRITE,
  ],
  isLimitedToPrivateRecords: false,
};

const buildContext = (): RowAccessEvaluationContext => ({
  flatFieldMetadataMaps,
  shouldIgnoreSoftDeleteDefaultFilter: false,
  fetchRecordShares: jest.fn(async ({ recordIds }) =>
    recordShares.filter((recordShare) =>
      recordIds.includes(recordShare.recordId),
    ),
  ),
  findPrivateRecordStates: jest.fn(async () => privateRecordStates),
});

const activeFilterGrant: PermissionsRowAccessGrants['rowLevelPermissionGrant'] =
  {
    recordFilter: { status: { eq: 'active' } },
    condition: { sql: 'TRUE', parameters: {} },
  };

const findAdmitted = ({
  grants,
  context = buildContext(),
}: {
  grants: Partial<PermissionsRowAccessGrants>;
  context?: RowAccessEvaluationContext;
}) =>
  findPermissionsAdmittedRecordIds({
    policy: { kind: 'gated', grants: { ...noGrants, ...grants } },
    records,
    context,
  });

describe('findPermissionsAdmittedRecordIds', () => {
  it('admits every record when open and none when denied', async () => {
    const context = buildContext();

    expect(
      await findPermissionsAdmittedRecordIds({
        policy: { kind: 'open' },
        records,
        context,
      }),
    ).toEqual(new Set(records.map((record) => record.id)));
    expect(
      await findPermissionsAdmittedRecordIds({
        policy: { kind: 'denied' },
        records,
        context,
      }),
    ).toEqual(new Set());
  });

  it('keeps the object grant to public records, treating a record it cannot find as public', async () => {
    expect(await findAdmitted({ grants: { isObjectGranted: true } })).toEqual(
      new Set(['active-shared', 'archived-shared']),
    );
  });

  it('matches the role filter on public record values', async () => {
    expect(
      await findAdmitted({
        grants: { rowLevelPermissionGrant: activeFilterGrant },
      }),
    ).toEqual(new Set(['active-shared']));
  });

  it('admits records shared with the named principals only', async () => {
    expect(await findAdmitted({ grants: { shareGrant } })).toEqual(
      new Set(['active-shared', 'archived-shared']),
    );
    expect(
      await findAdmitted({
        grants: {
          shareGrant: { ...shareGrant, isLimitedToPrivateRecords: true },
        },
      }),
    ).toEqual(new Set());
  });

  it('admits private records to their creator', async () => {
    expect(
      await findAdmitted({
        grants: { creatorGrant: { workspaceMemberId: MEMBER_ID } },
      }),
    ).toEqual(new Set(['active-private']));
  });

  it('unions the paths and only asks shares about records the role did not admit', async () => {
    const context = buildContext();

    expect(
      await findAdmitted({
        grants: {
          areRoleGrantsLimitedToPublicRecords: false,
          rowLevelPermissionGrant: activeFilterGrant,
          shareGrant,
        },
        context,
      }),
    ).toEqual(new Set(['active-shared', 'active-private', 'archived-shared']));
    expect(context.findPrivateRecordStates).not.toHaveBeenCalled();
    expect(context.fetchRecordShares).toHaveBeenCalledWith({
      objectMetadataId: flatObjectMetadata.id,
      recordIds: ['archived-shared'],
    });
  });

  it('holds shares and creators to the role filter when they cannot reach beyond the role', async () => {
    expect(
      await findAdmitted({
        grants: {
          areRecordGrantsHeldToRowLevelPermissions: true,
          rowLevelPermissionGrant: {
            recordFilter: { status: { eq: 'archived' } },
            condition: { sql: 'TRUE', parameters: {} },
          },
          shareGrant: { ...shareGrant, isLimitedToPrivateRecords: true },
          creatorGrant: { workspaceMemberId: MEMBER_ID },
        },
      }),
    ).toEqual(new Set(['archived-shared']));
  });
});
