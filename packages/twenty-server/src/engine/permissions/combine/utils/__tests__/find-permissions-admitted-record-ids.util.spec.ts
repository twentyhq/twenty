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
  type RowAccessRecord,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/rls/utils/resolve-row-level-permission-record-filter.util';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';

jest.mock(
  'src/engine/permissions/rls/utils/resolve-row-level-permission-record-filter.util',
);

const MEMBER_ID = 'member-1';
const MEMBER_ROLE_ID = 'member-role';

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

const fullAccess = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const rolePrincipal: PermissionsPrincipal = {
  workspaceId: 'workspace-id',
  intersectionOf: { userWorkspaceRoleId: MEMBER_ROLE_ID },
};

const memberPrincipal: PermissionsPrincipal = {
  ...rolePrincipal,
  workspaceMember: { id: MEMBER_ID } as PermissionsPrincipal['workspaceMember'],
};

const deniedPrincipal: PermissionsPrincipal = {
  ...memberPrincipal,
  intersectionOf: { userWorkspaceRoleId: 'missing-role' },
};

const filterByStatus = (status: string) =>
  jest
    .mocked(resolveRowLevelPermissionRecordFilter)
    .mockReturnValue({ status: { eq: status } });

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
  principal,
  featureFlagKeys = [FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED],
  context = buildContext(),
}: {
  principal: PermissionsPrincipal;
  featureFlagKeys?: FeatureFlagKey[];
  context?: RowAccessEvaluationContext;
}) =>
  findPermissionsAdmittedRecordIds({
    principal,
    environment: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      rolesPermissions: {
        [MEMBER_ROLE_ID]: { [flatObjectMetadata.id]: fullAccess },
      },
      flatApplicationMaps: { byId: {} },
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
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
  beforeEach(() => {
    jest.mocked(resolveRowLevelPermissionRecordFilter).mockReturnValue(null);
  });

  it('admits no record to a role without access', async () => {
    expect(await findAdmitted({ principal: deniedPrincipal })).toEqual(
      new Set(),
    );
  });

  it('keeps the role to public records, treating a record it cannot find as public', async () => {
    expect(await findAdmitted({ principal: rolePrincipal })).toEqual(
      new Set(['active-shared', 'archived-shared']),
    );
  });

  it('matches the role filter on public record values', async () => {
    filterByStatus('active');

    expect(await findAdmitted({ principal: rolePrincipal })).toEqual(
      new Set(['active-shared']),
    );
  });

  it('admits records shared with the member beyond the role, ignoring shares with everyone', async () => {
    expect(
      await findAdmitted({
        principal: deniedPrincipal,
        featureFlagKeys: [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
      }),
    ).toEqual(new Set(['active-shared', 'archived-shared']));
  });

  it('admits private records to their creator within the role filter', async () => {
    filterByStatus('none');

    expect(await findAdmitted({ principal: memberPrincipal })).toEqual(
      new Set(),
    );

    filterByStatus('active');

    expect(await findAdmitted({ principal: memberPrincipal })).toEqual(
      new Set(['active-shared', 'active-private']),
    );
  });

  it('only asks shares about records the role did not admit', async () => {
    const context = buildContext();

    filterByStatus('active');

    expect(
      await findAdmitted({
        principal: memberPrincipal,
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
