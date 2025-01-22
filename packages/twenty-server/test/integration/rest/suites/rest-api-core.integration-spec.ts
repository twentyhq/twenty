import {
  FAKE_PERSON_ID,
  PERSON_1_ID,
  PERSON_2_ID,
} from 'test/integration/constants/mock-person-ids.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

describe('REST API > Core (integration)', () => {
  let people: any;

  beforeAll(async () => {
    const personCity1 = generateRecordName(PERSON_1_ID);
    const personCity2 = generateRecordName(PERSON_2_ID);

    // TODO: move this creation to REST API when the POST method is migrated
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

    people = response.body.data.createPeople;
  });

  describe('Delete one', () => {
    it('1a. should have created people before delete', async () => {
      expect(people.length).toBeTruthy();
    });

    it('1b. should delete one person', async () => {
      const response = await makeRestAPIRequest(
        'delete',
        `/people/${PERSON_1_ID}`,
      );

      expect(response.body.data.deletePerson.id).toBeTruthy();
    });

    it('1.c should return a BadRequestException when trying to delete a non-existing person', async () => {
      const response = await makeRestAPIRequest(
        'delete',
        `/people/${FAKE_PERSON_ID}`,
      );

      expect(response.body.errors).toBeTruthy();
    });
  });
});
