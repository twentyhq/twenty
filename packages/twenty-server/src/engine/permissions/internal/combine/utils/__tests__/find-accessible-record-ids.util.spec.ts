/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  type ObjectRecordsPermissions,
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
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findAccessibleRecordIds } from 'src/engine/permissions/internal/combine/utils/find-accessible-record-ids.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/internal/record-share/types/record-share-grant.type';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';

jest.mock(
  'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util',
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

const fullAccess: ObjectRecordsPermissions = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  unreadableFields: [],
  uneditableFields: [],
};

const accessThroughRlsRule: ObjectRecordsPermissions = {
  ...fullAccess,
  canReadAllRecords: false,
  rowLevelRecordsPermissions: [
    {
      ruleId: 'rule-id',
      canCreateRecords: false,
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      predicates: [],
      predicateGroups: [],
      unreadableFields: [],
      uneditableFields: [],
    },
  ],
};

const rolePrincipals: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: { type: 'role', roleId: MEMBER_ROLE_ID },
  applicationPrincipal: { type: 'customApplication' },
};

const memberPrincipals: PermissionsPrincipalsWithRolesContext = {
  ...rolePrincipals,
  mainPrincipal: {
    type: 'workspaceMember',
    roleId: MEMBER_ROLE_ID,
    workspaceMemberId: MEMBER_ID,
  },
  applicationPrincipal: { type: 'customApplication' },
};

const deniedPrincipals: PermissionsPrincipalsWithRolesContext = {
  ...memberPrincipals,
  mainPrincipal: {
    type: 'workspaceMember',
    roleId: 'missing-role',
    workspaceMemberId: MEMBER_ID,
  },
  applicationPrincipal: { type: 'customApplication' },
};

let isRoleRestrictedByRlsRule = false;

const restrictRoleToStatusThroughRlsRule = (status: string) => {
  isRoleRestrictedByRlsRule = true;
  jest
    .mocked(resolveRlsRuleRecordFilter)
    .mockReturnValue({ status: { eq: status } });
};

const buildContext = (): RowAccessEvaluationContext => ({
  shouldIgnoreSoftDeleteDefaultFilter: false,
  findRelationJoinValues: jest.fn().mockResolvedValue([]),
  fetchRecordShares: jest.fn(async ({ recordIds }) =>
    recordShares.filter((recordShare) =>
      recordIds.includes(recordShare.recordId),
    ),
  ),
  findPrivateRecordStates: jest.fn(async () => privateRecordStates),
});

const SHARING_WORKSPACE_FEATURE_FLAG_KEYS = [
  FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
  FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
];

const findGranted = ({
  principals,
  featureFlagKeys = [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED],
  context = buildContext(),
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  featureFlagKeys?: FeatureFlagKey[];
  context?: RowAccessEvaluationContext;
}) =>
  findAccessibleRecordIds({
    principals,
    metadataMaps: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      rolesPermissions: {
        [MEMBER_ROLE_ID]: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: {
            [flatObjectMetadata.id]: isRoleRestrictedByRlsRule
              ? accessThroughRlsRule
              : fullAccess,
          },
        },
      },
      featureFlagsMap: Object.fromEntries(
        featureFlagKeys.map((featureFlagKey) => [featureFlagKey, true]),
      ),
    },
    flatObjectMetadata,
    operationType: 'read',
    records,
    context,
  });

describe('findAccessibleRecordIds', () => {
  beforeEach(() => {
    isRoleRestrictedByRlsRule = false;
    jest.mocked(resolveRlsRuleRecordFilter).mockReturnValue(null);
  });

  it('grants a member whose role has no access only the private records they created', async () => {
    expect(await findGranted({ principals: deniedPrincipals })).toEqual(
      new Set(['active-private']),
    );
  });

  it('keeps the role to public records, treating a record it cannot find as public', async () => {
    expect(await findGranted({ principals: rolePrincipals })).toEqual(
      new Set(['active-shared', 'archived-shared']),
    );
  });

  it('matches the role filter on public record values', async () => {
    restrictRoleToStatusThroughRlsRule('active');

    expect(await findGranted({ principals: rolePrincipals })).toEqual(
      new Set(['active-shared']),
    );
  });

  it('grants records shared with or created by the member beyond the role', async () => {
    expect(
      await findGranted({
        principals: deniedPrincipals,
        featureFlagKeys: SHARING_WORKSPACE_FEATURE_FLAG_KEYS,
      }),
    ).toEqual(new Set(['active-shared', 'active-private', 'archived-shared']));
  });

  it('grants no shared or created record when a limiting role lacks all records', async () => {
    expect(
      await findGranted({
        principals: {
          ...memberPrincipals,
          limitingPrincipal: {
            type: 'agent',
            agentId: 'agent-1',
            roleId: 'missing-role',
          },
        },
        featureFlagKeys: SHARING_WORKSPACE_FEATURE_FLAG_KEYS,
      }),
    ).toEqual(new Set());
  });

  it('grants private records to their creator whatever the role filter', async () => {
    restrictRoleToStatusThroughRlsRule('none');

    expect(await findGranted({ principals: memberPrincipals })).toEqual(
      new Set(['active-private']),
    );

    restrictRoleToStatusThroughRlsRule('active');

    expect(await findGranted({ principals: memberPrincipals })).toEqual(
      new Set(['active-shared', 'active-private']),
    );
  });

  it('only asks shares about records the role did not grant', async () => {
    const context = buildContext();

    restrictRoleToStatusThroughRlsRule('active');

    expect(
      await findGranted({
        principals: memberPrincipals,
        featureFlagKeys: SHARING_WORKSPACE_FEATURE_FLAG_KEYS,
        context,
      }),
    ).toEqual(new Set(records.map((record) => record.id)));
    expect(context.fetchRecordShares).toHaveBeenCalledWith({
      objectMetadataId: flatObjectMetadata.id,
      recordIds: ['active-private', 'archived-shared'],
    });
  });
});
