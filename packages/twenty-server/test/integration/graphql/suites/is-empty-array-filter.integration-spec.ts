import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const EMPTY_PET_ID = '20202020-eeee-4000-8000-000000000001';
const FILLED_PET_ID = '20202020-eeee-4000-8000-000000000002';
const TEST_PET_IDS = [EMPTY_PET_ID, FILLED_PET_ID];

const findTestPetIds = async (filter: object): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'pet',
      objectMetadataPluralName: 'pets',
      gqlFields: 'id',
      filter: { and: [{ id: { in: TEST_PET_IDS } }, filter] },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.pets.edges.map(
    (edge: { node: { id: string } }) => edge.node.id,
  );
};

describe('isEmptyArray filter', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'pet',
        objectMetadataPluralName: 'pets',
        gqlFields: 'id',
        data: [
          {
            id: EMPTY_PET_ID,
            name: 'Empty arrays pet',
            traits: [],
            interestingFacts: [],
          },
          {
            id: FILLED_PET_ID,
            name: 'Filled arrays pet',
            traits: ['PLAYFUL'],
            interestingFacts: ['Can open doors'],
          },
        ],
        upsert: true,
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'pet',
        objectMetadataPluralName: 'pets',
        gqlFields: 'id',
        filter: { id: { in: TEST_PET_IDS } },
      }),
    );
  });

  it.each(['traits', 'interestingFacts'])(
    'should match arrays emptied through the API on %s when true',
    async (fieldName) => {
      const ids = await findTestPetIds({
        [fieldName]: { isEmptyArray: true },
      });

      expect(ids).toEqual([EMPTY_PET_ID]);
    },
  );

  it.each(['traits', 'interestingFacts'])(
    'should match non-empty arrays on %s when false',
    async (fieldName) => {
      const ids = await findTestPetIds({
        [fieldName]: { isEmptyArray: false },
      });

      expect(ids).toEqual([FILLED_PET_ID]);
    },
  );
});
