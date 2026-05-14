import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

// Distinct ID prefix (eeee / ffff) so this suite doesn't collide with
// filter-by-relation-field.integration-spec.ts when both run against the
// shared workspace database.
const TEST_COMPANY_IDS = {
  AIRBNB: '20202020-eeee-4000-8000-000000000001',
  STRIPE: '20202020-eeee-4000-8000-000000000002',
  NOTION: '20202020-eeee-4000-8000-000000000003',
};

const TEST_PERSON_IDS = {
  AIRBNB_ENGINEER: '20202020-ffff-4000-8000-000000000001',
  AIRBNB_DESIGNER: '20202020-ffff-4000-8000-000000000002',
  STRIPE_ENGINEER: '20202020-ffff-4000-8000-000000000003',
  NOTION_ENGINEER: '20202020-ffff-4000-8000-000000000004',
  UNAFFILIATED: '20202020-ffff-4000-8000-000000000005',
};

const ALL_TEST_PERSON_IDS = Object.values(TEST_PERSON_IDS);

// updateMany / deleteMany / destroyMany / restoreMany all build a SELECT
// query builder, apply the filter to it, and morph it into UPDATE / DELETE
// (etc.). Relation-traversal filters add LEFT JOINs that TypeORM drops at
// morph time, which used to leave the WHERE clause referencing a phantom
// alias. The mutation runners now wrap the filter as an `id IN (SELECT id
// ...)` subquery so the joins survive — this suite verifies that contract
// for each of the four mutations.
describe('Mutate by relation field (e2e)', () => {
  const resetFixtures = async () => {
    const createCompanies = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id name',
      data: [
        { id: TEST_COMPANY_IDS.AIRBNB, name: 'AirbnbMutate' },
        { id: TEST_COMPANY_IDS.STRIPE, name: 'StripeMutate' },
        { id: TEST_COMPANY_IDS.NOTION, name: 'NotionMutate' },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createCompanies);

    const createPeople = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        {
          id: TEST_PERSON_IDS.AIRBNB_ENGINEER,
          companyId: TEST_COMPANY_IDS.AIRBNB,
          jobTitle: 'Engineer',
          city: 'Original City',
        },
        {
          id: TEST_PERSON_IDS.AIRBNB_DESIGNER,
          companyId: TEST_COMPANY_IDS.AIRBNB,
          jobTitle: 'Designer',
          city: 'Original City',
        },
        {
          id: TEST_PERSON_IDS.STRIPE_ENGINEER,
          companyId: TEST_COMPANY_IDS.STRIPE,
          jobTitle: 'Engineer',
          city: 'Original City',
        },
        {
          id: TEST_PERSON_IDS.NOTION_ENGINEER,
          companyId: TEST_COMPANY_IDS.NOTION,
          jobTitle: 'Engineer',
          city: 'Original City',
        },
        {
          id: TEST_PERSON_IDS.UNAFFILIATED,
          companyId: null,
          jobTitle: 'Engineer',
          city: 'Original City',
        },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createPeople);
  };

  beforeEach(async () => {
    // Each test mutates state — destroy any leftovers from a previous test
    // then re-create the canonical fixtures.
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_PERSON_IDS } },
      }),
    );

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: Object.values(TEST_COMPANY_IDS) } },
      }),
    );

    await resetFixtures();
  });

  it('should updateMany via a relation traversal filter', async () => {
    const updateOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id city',
      data: { city: 'Updated City' },
      filter: {
        and: [
          { id: { in: ALL_TEST_PERSON_IDS } },
          { company: { name: { eq: 'AirbnbMutate' } } },
        ],
      },
    });

    const updateResponse = await makeGraphqlAPIRequest(updateOperation);

    expect(updateResponse.body.errors).toBeUndefined();

    const updatedPeople = updateResponse.body.data.updatePeople;

    expect(updatedPeople).toHaveLength(2);
    expect(
      updatedPeople.map((person: { id: string }) => person.id).sort(),
    ).toEqual(
      [TEST_PERSON_IDS.AIRBNB_ENGINEER, TEST_PERSON_IDS.AIRBNB_DESIGNER].sort(),
    );

    const findOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id city',
      filter: { id: { in: ALL_TEST_PERSON_IDS } },
    });

    const findResponse = await makeGraphqlAPIRequest(findOperation);

    const cityByPersonId = Object.fromEntries(
      findResponse.body.data.people.edges.map(
        (edge: { node: { id: string; city: string } }) => [
          edge.node.id,
          edge.node.city,
        ],
      ),
    );

    // Both Airbnb people get the new city.
    expect(cityByPersonId[TEST_PERSON_IDS.AIRBNB_ENGINEER]).toEqual(
      'Updated City',
    );
    expect(cityByPersonId[TEST_PERSON_IDS.AIRBNB_DESIGNER]).toEqual(
      'Updated City',
    );

    // Other rows must be untouched — proves the join didn't widen the
    // mutation past the intended set.
    expect(cityByPersonId[TEST_PERSON_IDS.STRIPE_ENGINEER]).toEqual(
      'Original City',
    );
    expect(cityByPersonId[TEST_PERSON_IDS.NOTION_ENGINEER]).toEqual(
      'Original City',
    );
    expect(cityByPersonId[TEST_PERSON_IDS.UNAFFILIATED]).toEqual(
      'Original City',
    );
  });

  it('should deleteMany via a relation traversal filter (soft-delete)', async () => {
    const deleteOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id deletedAt',
      filter: {
        and: [
          { id: { in: ALL_TEST_PERSON_IDS } },
          { company: { name: { eq: 'NotionMutate' } } },
        ],
      },
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteOperation);

    expect(deleteResponse.body.errors).toBeUndefined();

    const deletedPeople = deleteResponse.body.data.deletePeople;

    expect(deletedPeople).toHaveLength(1);
    expect(deletedPeople[0].id).toEqual(TEST_PERSON_IDS.NOTION_ENGINEER);
    expect(deletedPeople[0].deletedAt).toBeTruthy();

    // Verify the rest are still live.
    const findOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: { id: { in: ALL_TEST_PERSON_IDS } },
    });

    const findResponse = await makeGraphqlAPIRequest(findOperation);
    const remainingIds = findResponse.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(remainingIds.sort()).toEqual(
      [
        TEST_PERSON_IDS.AIRBNB_ENGINEER,
        TEST_PERSON_IDS.AIRBNB_DESIGNER,
        TEST_PERSON_IDS.STRIPE_ENGINEER,
        TEST_PERSON_IDS.UNAFFILIATED,
      ].sort(),
    );
  });

  it('should restoreMany via a relation traversal filter', async () => {
    // Soft-delete first via a scalar filter (no traversal) so the restore
    // case is the only one exercising the traversal path.
    const deleteOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: {
        id: {
          in: [
            TEST_PERSON_IDS.AIRBNB_ENGINEER,
            TEST_PERSON_IDS.AIRBNB_DESIGNER,
            TEST_PERSON_IDS.STRIPE_ENGINEER,
          ],
        },
      },
    });

    await makeGraphqlAPIRequest(deleteOperation);

    const restoreOperation = restoreManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id deletedAt',
      filter: {
        and: [
          { id: { in: ALL_TEST_PERSON_IDS } },
          { company: { name: { eq: 'AirbnbMutate' } } },
        ],
      },
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreOperation);

    expect(restoreResponse.body.errors).toBeUndefined();

    const restoredPeople = restoreResponse.body.data.restorePeople;

    expect(restoredPeople).toHaveLength(2);
    expect(
      restoredPeople.map((person: { id: string }) => person.id).sort(),
    ).toEqual(
      [TEST_PERSON_IDS.AIRBNB_ENGINEER, TEST_PERSON_IDS.AIRBNB_DESIGNER].sort(),
    );
    restoredPeople.forEach((person: { deletedAt: string | null }) => {
      expect(person.deletedAt).toBeNull();
    });

    // The Stripe engineer was also soft-deleted but doesn't match the
    // traversal filter, so it must remain deleted.
    const findStripe = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: { id: { in: [TEST_PERSON_IDS.STRIPE_ENGINEER] } },
    });

    const findStripeResponse = await makeGraphqlAPIRequest(findStripe);

    expect(findStripeResponse.body.data.people.edges).toEqual([]);
  });

  it('should destroyMany via a relation traversal filter (hard-delete)', async () => {
    const destroyOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: {
        and: [
          { id: { in: ALL_TEST_PERSON_IDS } },
          { company: { name: { eq: 'StripeMutate' } } },
        ],
      },
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyOperation);

    expect(destroyResponse.body.errors).toBeUndefined();

    const destroyedPeople = destroyResponse.body.data.destroyPeople;

    expect(destroyedPeople).toHaveLength(1);
    expect(destroyedPeople[0].id).toEqual(TEST_PERSON_IDS.STRIPE_ENGINEER);

    // The Stripe engineer should be gone even when querying with deletedAt
    // filter (destroy is a hard-delete).
    const findOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      filter: {
        id: { in: [TEST_PERSON_IDS.STRIPE_ENGINEER] },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const findResponse = await makeGraphqlAPIRequest(findOperation);

    expect(findResponse.body.data.people.edges).toEqual([]);
  });

  it('should keep scalar-only mutations working unchanged', async () => {
    // No relation traversal — the builder helper should keep emitting the
    // existing direct-WHERE SQL (no IN-subquery wrap). Behavior must match
    // what the pre-PR code path produced.
    const updateOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id city',
      data: { city: 'Scalar Updated City' },
      filter: { id: { eq: TEST_PERSON_IDS.UNAFFILIATED } },
    });

    const updateResponse = await makeGraphqlAPIRequest(updateOperation);

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updatePeople).toHaveLength(1);
    expect(updateResponse.body.data.updatePeople[0].city).toEqual(
      'Scalar Updated City',
    );
  });
});
