import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  VISIBLE_COMPANY_NAME_TOKEN,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import { upsertContainsRlsPredicate } from 'test/integration/graphql/utils/upsert-contains-rls-predicate.util';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';

const COMPANY_ID = '20202020-dddd-4000-8000-000000000001';
const COMPANY_NAME = `RLS Per Parent Limit ${VISIBLE_COMPANY_NAME_TOKEN} Co`;

const VISIBLE_JOB_TITLE_TOKEN = 'Visible';
const HIDDEN_PEOPLE_COUNT = QUERY_MAX_RECORDS_FROM_RELATION + 1;
const VISIBLE_PEOPLE_COUNT = 2;

const buildPersonId = (index: number) =>
  `20202020-dddd-4001-8000-${index.toString().padStart(12, '0')}`;

const HIDDEN_PERSON_IDS_INSERTED_FIRST = Array.from(
  { length: HIDDEN_PEOPLE_COUNT },
  (_, i) => buildPersonId(i),
);
const VISIBLE_PERSON_IDS = Array.from(
  { length: VISIBLE_PEOPLE_COUNT },
  (_, i) => buildPersonId(HIDDEN_PEOPLE_COUNT + i),
);

describe('nested relation per-parent limit respects row-level permission predicates', () => {
  let rlsRole: CompanyNameRlsRoleSetup;

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'RLS Per Parent Limit Test Role',
      description: 'Role for testing RLS on the per-parent relation limit',
    });

    await upsertContainsRlsPredicate({
      roleId: rlsRole.customRoleId,
      objectNameSingular: 'person',
      fieldName: 'jobTitle',
      value: VISIBLE_JOB_TITLE_TOKEN,
    });

    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [{ id: COMPANY_ID, name: COMPANY_NAME }],
      }),
    );

    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: [
          ...HIDDEN_PERSON_IDS_INSERTED_FIRST.map((id) => ({
            id,
            companyId: COMPANY_ID,
            jobTitle: 'Hidden',
          })),
          ...VISIBLE_PERSON_IDS.map((id) => ({
            id,
            companyId: COMPANY_ID,
            jobTitle: `${VISIBLE_JOB_TITLE_TOKEN} contributor`,
          })),
        ],
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: {
          id: {
            in: [...HIDDEN_PERSON_IDS_INSERTED_FIRST, ...VISIBLE_PERSON_IDS],
          },
        },
      }),
    );

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: [COMPANY_ID] } },
      }),
    );

    await cleanupCompanyNameRlsRole(rlsRole);
  });

  it('does not let hidden related records consume the per-parent limit', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `
          id
          people {
            edges {
              node {
                id
              }
            }
          }
        `,
        filter: { id: { in: [COMPANY_ID] } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const companyEdges = response.body.data.companies.edges;

    expect(companyEdges).toHaveLength(1);

    const relatedPeopleIds = companyEdges[0].node.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(relatedPeopleIds.sort()).toEqual([...VISIBLE_PERSON_IDS].sort());
  });
});
