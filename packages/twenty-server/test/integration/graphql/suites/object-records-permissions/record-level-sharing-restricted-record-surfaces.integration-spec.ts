import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { searchFactory } from 'test/integration/graphql/utils/search-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const SEARCH_TERM = `Quorvex${randomUUID().slice(0, 8)}`;
const RESTRICTED_COMPANY_ID = randomUUID();
const OPEN_COMPANY_ID = randomUUID();
const COMPANY_IDS = [RESTRICTED_COMPANY_ID, OPEN_COMPANY_ID];
const PERSON_ID = randomUUID();
const NOTE_ID = randomUUID();
const NOTE_TARGET_ID = randomUUID();

const SET_SHARE = parse(
  `mutation SetShare($target: RecordSharingTargetInput!, $principal: RecordSharePrincipalInput!, $enabled: Boolean!, $accessLevel: RecordShareAccessLevel) { setRecordShare(target: $target, principal: $principal, enabled: $enabled, accessLevel: $accessLevel) { generalAccessLevel } }`,
);

const FIND_COMPANIES = parse(
  `query Companies($filter: CompanyFilterInput) { companies(filter: $filter) { totalCount edges { node { id } } } }`,
);

const collectIds = (edges: { node: { id: string } }[]) =>
  edges.map(({ node }) => node.id).sort();

describe('A restricted record on an object open by default', () => {
  let companyObjectMetadataId: string;
  let shares: RecordShareStorageService;

  const setShare = (
    principal: { everyone: true } | { workspaceMemberId: string },
    enabled: boolean,
    accessLevel = RecordShareAccessLevel.READ,
  ) =>
    makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: {
          target: {
            objectMetadataId: companyObjectMetadataId,
            recordId: RESTRICTED_COMPANY_ID,
          },
          principal,
          enabled,
          accessLevel,
        },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

  const findCompanyIds = async (token: string) => {
    const response = await makeGraphqlApiRequest(
      {
        query: FIND_COMPANIES,
        variables: { filter: { id: { in: COMPANY_IDS } } },
      },
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return {
      ids: collectIds(response.body.data.companies.edges),
      totalCount: response.body.data.companies.totalCount,
    };
  };

  const createRecord = async (
    objectMetadataSingularName: string,
    data: Record<string, unknown>,
  ) => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName,
        gqlFields: 'id',
        data,
      }),
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    companyObjectMetadataId = (
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({ where: { workspaceId, nameSingular: 'company' } })
    ).id;

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });

    await createRecord('company', {
      id: RESTRICTED_COMPANY_ID,
      name: `${SEARCH_TERM} restricted`,
    });
    await createRecord('company', {
      id: OPEN_COMPANY_ID,
      name: `${SEARCH_TERM} open`,
    });
    await createRecord('person', {
      id: PERSON_ID,
      name: { firstName: 'Works at', lastName: 'Restricted' },
      companyId: RESTRICTED_COMPANY_ID,
    });
    await createRecord('note', { id: NOTE_ID, title: 'On the restricted' });
    await createRecord('noteTarget', {
      id: NOTE_TARGET_ID,
      noteId: NOTE_ID,
      targetCompanyId: RESTRICTED_COMPANY_ID,
    });

    const restricted = await setShare({ everyone: true }, false);

    expect(restricted.body.errors).toBeUndefined();
    expect(restricted.body.data.setRecordShare.generalAccessLevel).toBe(
      RecordShareAccessLevel.NONE,
    );
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: false,
      expectToFail: false,
    });
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId: companyObjectMetadataId,
      recordIds: COMPANY_IDS,
    });

    for (const [singular, plural, ids] of [
      ['noteTarget', 'noteTargets', [NOTE_TARGET_ID]],
      ['note', 'notes', [NOTE_ID]],
      ['person', 'people', [PERSON_ID]],
      ['company', 'companies', COMPANY_IDS],
    ] as const) {
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: singular,
          objectMetadataPluralName: plural,
          gqlFields: 'id',
          filter: { id: { in: [...ids] } },
        }),
      );
    }
  });

  it('should leave it out of lists and their total count', async () => {
    expect(await findCompanyIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual({
      ids: [OPEN_COMPANY_ID],
      totalCount: 1,
    });
    expect(await findCompanyIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual({
      ids: [...COMPANY_IDS].sort(),
      totalCount: 2,
    });
  });

  it('should not find it by id', async () => {
    const response = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        filter: { id: { eq: RESTRICTED_COMPANY_ID } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.data?.company ?? null).toBeNull();
  });

  it('should leave it out of group counts', async () => {
    const response = await makeGraphqlApiRequest(
      groupByOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        groupBy: [{ name: true }],
        filter: { id: { in: COMPANY_IDS } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.companiesGroupBy.map(
        (group: { groupByDimensionValues: string[] }) =>
          group.groupByDimensionValues,
      ),
    ).toEqual([[`${SEARCH_TERM} open`]]);
  });

  it('should hide it behind the relation of a record that points at it', async () => {
    const readCompanyOfPerson = async (token: string) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id company { id }',
          filter: { id: { eq: PERSON_ID } },
        }),
        token,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.people.edges[0]?.node.company ?? null;
    };

    expect(
      await readCompanyOfPerson(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeNull();
    expect(await readCompanyOfPerson(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual({
      id: RESTRICTED_COMPANY_ID,
    });
  });

  it('should leave it out of search', async () => {
    const searchCompanyIds = async (token: string) => {
      const response = await makeGraphqlApiRequest(
        searchFactory({
          searchInput: SEARCH_TERM,
          includedObjectNameSingulars: ['company'],
          limit: 50,
        }),
        token,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.search.edges
        .map(({ node }: { node: { recordId: string } }) => node.recordId)
        .sort();
    };

    expect(await searchCompanyIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      OPEN_COMPANY_ID,
    ]);
    expect(await searchCompanyIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual(
      [...COMPANY_IDS].sort(),
    );
  });

  it('should leave it out of the REST API', async () => {
    const response = await makeRestApiRequest({
      method: 'get',
      path: `/companies?filter=id[in]:["${RESTRICTED_COMPANY_ID}","${OPEN_COMPANY_ID}"]`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.status).toBe(200);
    expect(
      response.body.data.companies.map(({ id }: { id: string }) => id),
    ).toEqual([OPEN_COMPANY_ID]);
  });

  it('should hide the note attached to it only', async () => {
    const findNoteIds = async (token: string) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'note',
          objectMetadataPluralName: 'notes',
          gqlFields: 'id',
          filter: { id: { eq: NOTE_ID } },
        }),
        token,
      );

      expect(response.body.errors).toBeUndefined();

      return collectIds(response.body.data.notes.edges);
    };

    expect(await findNoteIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([]);
    expect(await findNoteIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual([NOTE_ID]);
  });

  it('should leave it out of the events delivered to others', async () => {
    const memberRole = await findOneRoleByLabel({ label: 'Member' });
    const { rolesPermissions, flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(workspaceId, [
        'rolesPermissions',
        'flatObjectMetadataMaps',
      ]);
    const companyObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: companyObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(companyObjectMetadata)) {
      throw new Error('Company object metadata is missing');
    }

    const admittedRecordIds =
      await getAppProviderByClassName<RecordAccessPolicyService>(
        'RecordAccessPolicyService',
      )
        .buildEventRecordAccessGate({
          name: 'company.updated',
          workspaceId,
          objectMetadata: companyObjectMetadata,
          events: COMPANY_IDS.map((recordId) => ({
            recordId,
            properties: { after: { id: recordId } },
          })) as ObjectRecordEvent[],
        })
        .resolveAdmittedRecordIds({
          isSystemContext: false,
          objectsPermissions: rolesPermissions[memberRole.id],
          principalIds: [
            EVERYONE_PRINCIPAL_ID,
            WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            memberRole.id,
          ],
          isOwningApplication: () => false,
          resolveRowLevelPermissionRecordFilter: () => null,
        });

    expect([...admittedRecordIds]).toEqual([OPEN_COMPANY_ID]);
  });

  it('should leave it untouched by bulk updates and deletes that match it', async () => {
    const updated = await makeGraphqlApiRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: { employees: 42 },
        filter: { id: { in: COMPANY_IDS } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(updated.body.errors).toBeUndefined();
    expect(
      updated.body.data.updateCompanies.map(({ id }: { id: string }) => id),
    ).toEqual([OPEN_COMPANY_ID]);

    const deleted = await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: COMPANY_IDS } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(deleted.body.errors).toBeUndefined();
    expect(
      deleted.body.data.deleteCompanies.map(({ id }: { id: string }) => id),
    ).toEqual([OPEN_COMPANY_ID]);

    const restricted = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id employees deletedAt',
        filter: { id: { eq: RESTRICTED_COMPANY_ID } },
      }),
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(restricted.body.data.company).toMatchObject({
      employees: null,
      deletedAt: null,
    });

    await makeGraphqlApiRequest(
      restoreManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { eq: OPEN_COMPANY_ID } },
      }),
    );
  });

  it('should show it on every surface once it is shared with the member', async () => {
    const shared = await setShare(
      { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
      true,
    );

    expect(shared.body.errors).toBeUndefined();
    expect((await findCompanyIds(APPLE_JONY_MEMBER_ACCESS_TOKEN)).ids).toEqual(
      [...COMPANY_IDS].sort(),
    );

    const person = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id company { id }',
        filter: { id: { eq: PERSON_ID } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(person.body.data.people.edges[0].node.company).toEqual({
      id: RESTRICTED_COMPANY_ID,
    });

    const notes = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'note',
        objectMetadataPluralName: 'notes',
        gqlFields: 'id',
        filter: { id: { eq: NOTE_ID } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(collectIds(notes.body.data.notes.edges)).toEqual([NOTE_ID]);
  });
});
