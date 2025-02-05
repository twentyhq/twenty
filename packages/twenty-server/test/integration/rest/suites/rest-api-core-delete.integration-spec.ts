import {
  FAKE_PERSON_ID,
  PERSON_1_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('Core REST API Delete One endpoint', () => {
  let people: any;

  beforeAll(async () => {
    const personCity1 = generateRecordName(PERSON_1_ID);

    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        id: PERSON_1_ID,
        city: personCity1,
      },
    });

    people = response.body.data.createPeople;
    expect(people.length).toBe(1);
    expect(people[0].id).toBe(PERSON_1_ID);
  });

  afterAll(async () => {
    // TODO: move this creation to REST API when the GET method is migrated
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      filter: {
        id: {
          eq: PERSON_1_ID,
        },
      },
    });

    await makeGraphqlAPIRequest(graphqlOperation)
      .expect(400)
      .expect((res) => {
        expect(res.body.error.message).toContain(`Record not found`);
      });
  });

  it('1a. should delete one person', async () => {
    const response = await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
    });

    expect(response.body.data.deletePerson.id).toBe(PERSON_1_ID);
  });

  it('1.b. should return a BadRequestException when trying to delete a non-existing person', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${FAKE_PERSON_ID}`,
    })
      .expect(400)
      .expect((res) => {
        expect(res.body.messages[0]).toContain(
          `Could not find any entity of type "person"`,
        );
        expect(res.body.error).toBe('Bad Request');
      });
  });

  it('1.c. should return an UnauthorizedException when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
      headers: {
        authorization: '',
      },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });

  it('1.d. should return an UnauthorizedException when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
      headers: {
        authorization: 'Bearer invalid-token',
      },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
      });
  });

  it('1.e. should return an UnauthorizedException when an expired token is provided', async () => {
    await makeRestAPIRequest({
      method: 'delete',
      path: `/people/${PERSON_1_ID}`,
      headers: {
        authorization: `Bearer ${EXPIRED_ACCESS_TOKEN}`,
      },
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('Token has expired.'); // Adjust this based on your API's error response
      });
  });
});
