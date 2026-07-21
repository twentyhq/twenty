import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';

const HOT_COMPANY_ID = '20202020-ffff-4000-8000-000000000001';
const SMALL_COMPANY_ID = '20202020-ffff-4000-8000-000000000002';
const SOFT_DELETED_COMPANY_ID = '20202020-ffff-4000-8000-000000000003';
const EMPTY_COMPANY_ID = '20202020-ffff-4000-8000-000000000004';

// A parent with more children than the per-parent budget, plus a sibling with
// only a few. The nested relation must cap the hot parent and still return all
// of the small parent's children (no starvation from a flat global limit).
const HOT_PEOPLE_COUNT = QUERY_MAX_RECORDS_FROM_RELATION + 5;
const SMALL_PEOPLE_COUNT = 3;
const SOFT_DELETED_TOTAL_PEOPLE_COUNT = 12;
const SOFT_DELETED_REMOVED_PEOPLE_COUNT = 5;
const SOFT_DELETED_REMAINING_PEOPLE_COUNT =
  SOFT_DELETED_TOTAL_PEOPLE_COUNT - SOFT_DELETED_REMOVED_PEOPLE_COUNT;

const buildPersonId = (index: number) =>
  `20202020-eeee-4000-8000-${index.toString().padStart(12, '0')}`;

let nextPersonIndex = 1;
const takePersonIds = (count: number) =>
  Array.from({ length: count }, () => buildPersonId(nextPersonIndex++));

const HOT_PERSON_IDS = takePersonIds(HOT_PEOPLE_COUNT);
const SMALL_PERSON_IDS = takePersonIds(SMALL_PEOPLE_COUNT);
const SOFT_DELETED_PERSON_IDS = takePersonIds(SOFT_DELETED_TOTAL_PEOPLE_COUNT);
const SOFT_DELETED_REMOVED_PERSON_IDS = SOFT_DELETED_PERSON_IDS.slice(
  0,
  SOFT_DELETED_REMOVED_PEOPLE_COUNT,
);

const ALL_PERSON_IDS = [
  ...HOT_PERSON_IDS,
  ...SMALL_PERSON_IDS,
  ...SOFT_DELETED_PERSON_IDS,
];
const ALL_COMPANY_IDS = [
  HOT_COMPANY_ID,
  SMALL_COMPANY_ID,
  SOFT_DELETED_COMPANY_ID,
  EMPTY_COMPANY_ID,
];

describe('Nested relation per-parent limit (e2e)', () => {
  beforeAll(async () => {
    const createCompanies = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      data: [
        { id: HOT_COMPANY_ID, name: 'Hot relation company' },
        { id: SMALL_COMPANY_ID, name: 'Small relation company' },
        { id: SOFT_DELETED_COMPANY_ID, name: 'Soft-deleted relation company' },
        { id: EMPTY_COMPANY_ID, name: 'Empty relation company' },
      ],
      upsert: false,
    });

    await makeGraphqlAPIRequest(createCompanies);

    const createPeople = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        ...HOT_PERSON_IDS.map((id) => ({ id, companyId: HOT_COMPANY_ID })),
        ...SMALL_PERSON_IDS.map((id) => ({ id, companyId: SMALL_COMPANY_ID })),
        ...SOFT_DELETED_PERSON_IDS.map((id) => ({
          id,
          companyId: SOFT_DELETED_COMPANY_ID,
        })),
      ],
      upsert: false,
    });

    await makeGraphqlAPIRequest(createPeople);

    // Soft-delete a subset so the per-parent selection must exclude them.
    const softDeletePeople = deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: { id: { in: SOFT_DELETED_REMOVED_PERSON_IDS } },
    });

    await makeGraphqlAPIRequest(softDeletePeople);
  });

  afterAll(async () => {
    const destroyPeople = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: { id: { in: ALL_PERSON_IDS } },
    });

    await makeGraphqlAPIRequest(destroyPeople);

    const destroyCompanies = destroyManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      filter: { id: { in: ALL_COMPANY_IDS } },
    });

    await makeGraphqlAPIRequest(destroyCompanies);
  });

  it('caps a hot parent at the per-parent limit without starving siblings', async () => {
    const queryData = findManyOperationFactory({
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
      filter: { id: { in: [HOT_COMPANY_ID, SMALL_COMPANY_ID] } },
    });

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.companies.edges;

    const hotCompany = edges.find(
      (edge: { node: { id: string } }) => edge.node.id === HOT_COMPANY_ID,
    );
    const smallCompany = edges.find(
      (edge: { node: { id: string } }) => edge.node.id === SMALL_COMPANY_ID,
    );

    // Hot parent is capped to the per-parent budget instead of dumping all of
    // its children into a single connection.
    expect(hotCompany.node.people.edges).toHaveLength(
      QUERY_MAX_RECORDS_FROM_RELATION,
    );

    // Small parent still receives every one of its children — the hot parent no
    // longer consumes the whole shared budget.
    expect(smallCompany.node.people.edges).toHaveLength(SMALL_PEOPLE_COUNT);
  });

  it('excludes soft-deleted records from the per-parent selection', async () => {
    const queryData = findManyOperationFactory({
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
      filter: { id: { in: [SOFT_DELETED_COMPANY_ID] } },
    });

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();

    const company = response.body.data.companies.edges[0];

    expect(company.node.people.edges).toHaveLength(
      SOFT_DELETED_REMAINING_PEOPLE_COUNT,
    );

    const returnedIds = company.node.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    for (const removedId of SOFT_DELETED_REMOVED_PERSON_IDS) {
      expect(returnedIds).not.toContain(removedId);
    }
  });

  it('returns an empty connection for a parent with no related records', async () => {
    const queryData = findManyOperationFactory({
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
      filter: { id: { in: [EMPTY_COMPANY_ID] } },
    });

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.companies.edges[0].node.people.edges,
    ).toHaveLength(0);
  });

  it('still resolves many-to-one relations from the other side', async () => {
    const queryData = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `
        id
        company {
          id
        }
      `,
      filter: { id: { in: SMALL_PERSON_IDS } },
    });

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.people.edges;

    expect(edges).toHaveLength(SMALL_PEOPLE_COUNT);

    for (const edge of edges) {
      expect(edge.node.company.id).toBe(SMALL_COMPANY_ID);
    }
  });
});
