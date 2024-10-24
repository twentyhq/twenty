import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const PERSON_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const PERSON_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const PERSON_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const PERSON_GQL_FIELDS = `
    id
    city
    jobTitle
    avatarUrl
    intro
    searchVector
    name {
      firstName
      lastName
    }   
    createdAt
    deletedAt
`;

describe('people resolvers (integration)', () => {
  it('1. should create and return people', async () => {
    const personCity1 = generateRecordName(PERSON_1_ID);
    const personCity2 = generateRecordName(PERSON_2_ID);
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          id: PERSON_1_ID,
          city: personCity1,
        },
        {
          id: PERSON_2_ID,
          city: personCity2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPeople).toHaveLength(2);

    response.body.data.createPeople.forEach((person) => {
      expect(person).toHaveProperty('city');
      expect([personCity1, personCity2]).toContain(person.city);

      expect(person).toHaveProperty('id');
      expect(person).toHaveProperty('jobTitle');
      expect(person).toHaveProperty('avatarUrl');
      expect(person).toHaveProperty('intro');
      expect(person).toHaveProperty('searchVector');
      expect(person).toHaveProperty('name');
      expect(person).toHaveProperty('createdAt');
      expect(person).toHaveProperty('deletedAt');
    });
  });

  it('1b. should create and return one person', async () => {
    const personCity3 = generateRecordName(PERSON_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        id: PERSON_3_ID,
        city: personCity3,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdPerson = response.body.data.createPerson;

    expect(createdPerson).toHaveProperty('city');
    expect(createdPerson.city).toEqual(personCity3);

    expect(createdPerson).toHaveProperty('id');
    expect(createdPerson).toHaveProperty('jobTitle');
    expect(createdPerson).toHaveProperty('avatarUrl');
    expect(createdPerson).toHaveProperty('intro');
    expect(createdPerson).toHaveProperty('searchVector');
    expect(createdPerson).toHaveProperty('name');
    expect(createdPerson).toHaveProperty('createdAt');
    expect(createdPerson).toHaveProperty('deletedAt');
  });

  it('2. should find many people', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.people;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const person = edges[0].node;

      expect(person).toHaveProperty('id');
      expect(person).toHaveProperty('jobTitle');
      expect(person).toHaveProperty('avatarUrl');
      expect(person).toHaveProperty('intro');
      expect(person).toHaveProperty('searchVector');
      expect(person).toHaveProperty('name');
      expect(person).toHaveProperty('createdAt');
      expect(person).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one person', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          eq: PERSON_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const person = response.body.data.person;

    expect(person).toHaveProperty('city');

    expect(person).toHaveProperty('id');
    expect(person).toHaveProperty('jobTitle');
    expect(person).toHaveProperty('avatarUrl');
    expect(person).toHaveProperty('intro');
    expect(person).toHaveProperty('searchVector');
    expect(person).toHaveProperty('name');
    expect(person).toHaveProperty('createdAt');
    expect(person).toHaveProperty('deletedAt');
  });

  it('3. should update many people', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        city: 'Updated City',
      },
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedPeople = response.body.data.updatePeople;

    expect(updatedPeople).toHaveLength(2);

    updatedPeople.forEach((person) => {
      expect(person.city).toEqual('Updated City');
    });
  });

  it('3b. should update one person', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        city: 'New City',
      },
      recordId: PERSON_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedPerson = response.body.data.updatePerson;

    expect(updatedPerson.city).toEqual('New City');
  });

  it('4. should find many people with updated city', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        city: {
          eq: 'Updated City',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.people.edges).toHaveLength(2);
  });

  it('4b. should find one person with updated city', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        city: {
          eq: 'New City',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.person.city).toEqual('New City');
  });

  it('5. should delete many people', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletePeople = response.body.data.deletePeople;

    expect(deletePeople).toHaveLength(2);

    deletePeople.forEach((person) => {
      expect(person.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one person', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: PERSON_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deletePerson.deletedAt).toBeTruthy();
  });

  it('6. should not find many people anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
      },
    });

    const findPeopleResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findPeopleResponse.body.data.people.edges).toHaveLength(0);
  });

  it('6b. should not find one person anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          eq: PERSON_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.person).toBeNull();
  });

  it('7. should find many deleted people with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.people.edges).toHaveLength(2);
  });

  it('7b. should find one deleted person with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          eq: PERSON_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.person.id).toEqual(PERSON_3_ID);
  });

  it('8. should destroy many people', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyPeople).toHaveLength(2);
  });

  it('8b. should destroy one person', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: PERSON_3_ID,
    });

    const destroyPeopleResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyPeopleResponse.body.data.destroyPerson).toBeTruthy();
  });

  it('9. should not find many people anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.people.edges).toHaveLength(0);
  });

  it('9b. should not find one person anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          eq: PERSON_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.person).toBeNull();
  });
});
