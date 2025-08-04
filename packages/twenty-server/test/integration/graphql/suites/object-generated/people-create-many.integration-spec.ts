import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

describe('people resolvers (integration)', () => {
  let person2Id: string;

  beforeAll(async () => {
    await deleteAllRecords('person');
  });

  it('should create many people', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
          jobTitle: 'Just Created',
          emails: {
            primaryEmail: 'john.doe@example.com',
          },
        },
        {
          name: {
            firstName: 'Jane',
            lastName: 'Smith',
          },
          jobTitle: 'Just Created',
          emails: {
            primaryEmail: 'jane.smith@example.com',
          },
        },
        {
          name: {
            firstName: 'Tim',
            lastName: 'Apple',
          },
          jobTitle: 'Just Created',
          emails: {
            primaryEmail: 'tim.apple@example.com',
          },
        },
      ],
      upsert: true,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPeople).toHaveLength(3);
    expect(response.body.errors).toBeUndefined();
  });

  it('should update many people', async () => {
    const findOneOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        emails: {
          primaryEmail: {
            eq: 'jane.smith@example.com',
          },
        },
      },
    });

    const findOneResponse = await makeGraphqlAPIRequest(findOneOperation);

    person2Id = findOneResponse.body.data.person.id;

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          emails: {
            primaryEmail: 'john.doe@example.com',
          },
          jobTitle: 'Just Updated',
        },
        {
          id: person2Id,
          jobTitle: 'Just Updated',
        },
      ],
      upsert: true,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const findAllOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
    });

    const findAllResponse = await makeGraphqlAPIRequest(findAllOperation);

    expect(findAllResponse.body.data.people.edges.length).toBe(3);

    expect(response.body.data.createPeople).toHaveLength(2);
    expect(response.body.errors).toBeUndefined();

    response.body.data.createPeople.forEach((person: any) => {
      expect(person.jobTitle).toEqual('Just Updated');
    });
  });

  it('should update and create many people', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
      data: [
        {
          emails: {
            primaryEmail: 'tim.apple@example.com',
          },
          jobTitle: 'Just Updated',
        },
        {
          jobTitle: 'Just Created',
          emails: {
            primaryEmail: 'paul.doe@example.com',
          },
        },
        {
          id: person2Id,
          jobTitle: 'Email Just Updated',
          emails: {
            primaryEmail: 'jane.smith@updated.com',
          },
        },
      ],
      upsert: true,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const findAllOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: PERSON_GQL_FIELDS,
    });

    const findAllResponse = await makeGraphqlAPIRequest(findAllOperation);

    expect(findAllResponse.body.data.people.edges.length).toBe(4);

    expect(response.body.data.createPeople).toHaveLength(3);
    expect(
      response.body.data.createPeople.find(
        (person: any) => person.id === person2Id,
      ).emails.primaryEmail,
    ).toEqual('jane.smith@updated.com');
    expect(response.body.errors).toBeUndefined();
  });
});
