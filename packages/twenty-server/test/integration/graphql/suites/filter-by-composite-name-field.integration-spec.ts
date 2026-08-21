import { generateILikeFiltersForCompositeFields } from 'twenty-shared/utils';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

const PERSON_GQL_FIELDS = `
  id
  name {
    firstName
    lastName
  }
`;

const JOHN_DOE_ID = '20202020-8f4a-4a3f-9c1b-000000000001';
const JANE_SMITH_ID = '20202020-8f4a-4a3f-9c1b-000000000002';
const JOHN_SMITH_ID = '20202020-8f4a-4a3f-9c1b-000000000003';

// Mirrors the FULL_NAME / CONTAINS branch of turnRecordFilterIntoGqlOperationFilter,
// which wraps the generated subfield clauses in a top-level `or`.
const findPeopleMatching = async (filterString: string) => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        or: generateILikeFiltersForCompositeFields(filterString, 'name', [
          'firstName',
          'lastName',
        ]),
      },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.people.edges.map(
    // @ts-expect-error legacy noImplicitAny
    (edge) => `${edge.node.name.firstName} ${edge.node.name.lastName}`,
  );
};

describe('filter by composite name field (integration)', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        { id: JOHN_DOE_ID, name: { firstName: 'John', lastName: 'Doe' } },
        { id: JANE_SMITH_ID, name: { firstName: 'Jane', lastName: 'Smith' } },
        { id: JOHN_SMITH_ID, name: { firstName: 'John', lastName: 'Smith' } },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPeople).toHaveLength(3);
  });

  afterAll(async () => {
    await deleteAllRecords('person');
  });

  it('should only return people matching every token when filtering on last and first name', async () => {
    // 'John Smith' also matches 'John' alone and 'Smith' alone, so it guards
    // against tokens being OR-ed together across subfields.
    expect(await findPeopleMatching('Doe John')).toEqual(['John Doe']);
  });

  it('should return people matching a single token when filtering on last name only', async () => {
    expect(await findPeopleMatching('Doe')).toEqual(['John Doe']);
  });
});
