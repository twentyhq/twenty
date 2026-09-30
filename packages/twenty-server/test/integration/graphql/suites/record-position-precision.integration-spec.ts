import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  computeEvenlySpacedPositions,
  computeMidpointPosition,
} from 'twenty-shared/utils';

const computePositionAfterRepeatedHalving = (numberOfHalvings: number) => {
  let upperPosition = 2;

  for (let index = 0; index < numberOfHalvings; index++) {
    upperPosition = computeMidpointPosition(1, upperPosition);
  }

  return upperPosition;
};

const EDGE_CASE_POSITIONS = [
  -Number.MAX_VALUE,
  -1e300,
  -1234567.890123456,
  -0.1,
  0,
  Number.MIN_VALUE,
  1e-300,
  computeMidpointPosition(0.1, 0.2),
  0.30000000000000004,
  ...computeEvenlySpacedPositions({
    startingPosition: 0.4,
    endingPosition: 0.5,
    numberOfPositions: 3,
  }),
  1,
  1 + Number.EPSILON,
  computePositionAfterRepeatedHalving(51),
  computePositionAfterRepeatedHalving(40),
  1 / 3 + 1,
  2 ** 53 + 2,
  1e300,
  Number.MAX_VALUE,
];

describe('record position precision', () => {
  const companies = EDGE_CASE_POSITIONS.map((position, index) => ({
    id: randomUUID(),
    name: `PositionPrecision${index}`,
    position,
  }));
  const companyIds = companies.map(({ id }) => id);

  beforeAll(async () => {
    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: companies,
      }),
    );

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: companyIds } },
      }),
    );
  });

  it('should store and read back every position without losing precision, in order', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id position',
        filter: { id: { in: companyIds } },
        orderBy: [{ position: 'AscNullsFirst' }],
        first: companies.length,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const storedCompanies = response.body.data.companies.edges.map(
      ({ node }: { node: { id: string; position: number } }) => node,
    );

    expect(storedCompanies).toEqual(
      companies.map(({ id, position }) => ({ id, position })),
    );
  });
});
