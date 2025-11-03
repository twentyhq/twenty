import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('people merge resolvers (integration)', () => {
  let createdPersonIdsForCleaning: string[] = [];

  afterEach(async () => {
    if (createdPersonIdsForCleaning.length > 0) {
      await deleteRecordsByIds('person', createdPersonIdsForCleaning);
      createdPersonIdsForCleaning = [];
    }
  });

  describe('merging composite fields', () => {
    it('should merge emails composite field correctly', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
            emails: {
              primaryEmail: 'john@example.com',
              additionalEmails: [
                'john.alt@example.com',
                'john.work@example.com',
              ],
            },
          },
          {
            name: {
              firstName: 'Jane',
              lastName: 'Doe',
            },
            emails: {
              primaryEmail: 'jane@example.com',
              additionalEmails: [
                'jane.alt@example.com',
                'jane.personal@example.com',
              ],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );

      expect(createResponse.body.data.createPeople).toHaveLength(2);

      const createdPersonIds = [...createResponse.body.data.createPeople].map(
        ({ id }: { id: string }) => id,
      );

      createdPersonIdsForCleaning.push(...createdPersonIds);

      const mergeOperation = mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        ids: createdPersonIds,
        conflictPriorityIndex: 0,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeOperation);

      expect(mergeResponse.body.errors).toBeUndefined();

      const mergedPerson = mergeResponse.body.data.mergePeople;

      expect(mergedPerson.emails.primaryEmail).toBe('john@example.com');
      expect(mergedPerson.emails.additionalEmails).toEqual(
        expect.arrayContaining([
          'jane@example.com',
          'john.alt@example.com',
          'john.work@example.com',
          'jane.alt@example.com',
          'jane.personal@example.com',
        ]),
      );
      expect(mergedPerson.emails.additionalEmails).toHaveLength(5);
    });

    it('should merge emails with deduplication', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: {
              firstName: 'Alice',
              lastName: 'Smith',
            },
            emails: {
              primaryEmail: 'alice@example.com',
              additionalEmails: [
                'shared@example.com',
                'alice.work@example.com',
              ],
            },
          },
          {
            name: {
              firstName: 'Bob',
              lastName: 'Smith',
            },
            emails: {
              primaryEmail: 'bob@example.com',
              additionalEmails: ['shared@example.com', 'bob.work@example.com'],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );

      const createdPersonIds = createResponse.body.data.createPeople.map(
        ({ id }: { id: string }) => id,
      );

      createdPersonIdsForCleaning.push(...createdPersonIds);

      const mergeOperation = mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        ids: createdPersonIds,
        conflictPriorityIndex: 0,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeOperation);
      const mergedPerson = mergeResponse.body.data.mergePeople;

      expect(mergedPerson.emails.primaryEmail).toBe('alice@example.com');
      const additionalEmails = mergedPerson.emails.additionalEmails;

      expect(additionalEmails).toHaveLength(4);
      expect(additionalEmails).toEqual(
        expect.arrayContaining([
          'bob@example.com',
          'shared@example.com',
          'alice.work@example.com',
          'bob.work@example.com',
        ]),
      );

      const duplicateCount = additionalEmails.filter(
        (email: string) => email === 'shared@example.com',
      ).length;

      expect(duplicateCount).toBe(1);
    });

    it('should respect priority index for unique constraint fields', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: {
              firstName: 'First',
              lastName: 'Person',
            },
            emails: {
              primaryEmail: 'first@example.com',
              additionalEmails: ['first.extra@example.com'],
            },
          },
          {
            name: {
              firstName: 'Second',
              lastName: 'Person',
            },
            emails: {
              primaryEmail: 'second@example.com',
              additionalEmails: ['second.extra@example.com'],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );

      const createdPersonIds = createResponse.body.data.createPeople.map(
        ({ id }: { id: string }) => id,
      );

      createdPersonIdsForCleaning.push(...createdPersonIds);

      const mergeWithPriority1 = mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        ids: createdPersonIds,
        conflictPriorityIndex: 1,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeWithPriority1);
      const mergedPerson = mergeResponse.body.data.mergePeople;

      expect(mergedPerson.emails.primaryEmail).toBe('second@example.com');
      expect(mergedPerson.emails.additionalEmails).toEqual(
        expect.arrayContaining([
          'first@example.com',
          'first.extra@example.com',
          'second.extra@example.com',
        ]),
      );
    });

    it('should handle dry run mode', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: {
              firstName: 'Test1',
              lastName: 'User',
            },
            emails: {
              primaryEmail: 'test1@example.com',
              additionalEmails: ['test1.extra@example.com'],
            },
          },
          {
            name: {
              firstName: 'Test2',
              lastName: 'User',
            },
            emails: {
              primaryEmail: 'test2@example.com',
              additionalEmails: ['test2.extra@example.com'],
            },
          },
        ],
      });
      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );

      const person1Id = createResponse.body.data.createPeople.find(
        (people: PersonWorkspaceEntity) =>
          people.emails.primaryEmail === 'test1@example.com',
      ).id;
      const person2Id = createResponse.body.data.createPeople.find(
        (people: PersonWorkspaceEntity) =>
          people.emails.primaryEmail === 'test2@example.com',
      ).id;

      createdPersonIdsForCleaning.push(person1Id, person2Id);

      const dryRunMergeOperation = mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        ids: [person1Id, person2Id],
        conflictPriorityIndex: 0,
        dryRun: true,
      });

      const dryRunResponse = await makeGraphqlAPIRequest(dryRunMergeOperation);

      expect(dryRunResponse.body.errors).toBeUndefined();

      const dryRunResult = dryRunResponse.body.data.mergePeople;

      expect(dryRunResult.emails.primaryEmail).toBe('test1@example.com');
      expect(dryRunResult.emails.additionalEmails).toEqual(
        expect.arrayContaining([
          'test2@example.com',
          'test1.extra@example.com',
          'test2.extra@example.com',
        ]),
      );

      const findOriginalPersons = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            eq: person2Id,
          },
        },
      });

      const findResponse = await makeGraphqlAPIRequest(findOriginalPersons);

      expect(findResponse.body.data.person).toBeTruthy();
      expect(findResponse.body.data.person.emails.primaryEmail).toBe(
        'test2@example.com',
      );
    });

    it('should merge phones and whatsapp composite fields correctly', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: {
              firstName: 'Alice',
              lastName: 'Johnson',
            },
            phones: {
              primaryPhoneNumber: '5551234567',
              primaryPhoneCountryCode: 'US',
              primaryPhoneCallingCode: '+1',
              additionalPhones: [
                {
                  number: '5559876543',
                  callingCode: '+1',
                  countryCode: 'US',
                },
              ],
            },
            whatsapp: {
              primaryPhoneNumber: '810407803',
              primaryPhoneCountryCode: 'FR',
              primaryPhoneCallingCode: '+33',
              additionalPhones: [
                {
                  number: '8104078034',
                  callingCode: '+91',
                  countryCode: 'IN',
                },
              ],
            },
          },
          {
            name: {
              firstName: 'Bob',
              lastName: 'Johnson',
            },
            phones: {
              primaryPhoneNumber: '4445556789',
              primaryPhoneCountryCode: 'US',
              primaryPhoneCallingCode: '+1',
              additionalPhones: [
                {
                  number: '4441112222',
                  callingCode: '+1',
                  countryCode: 'US',
                },
              ],
            },
            whatsapp: {
              primaryPhoneNumber: '987654321',
              primaryPhoneCountryCode: 'FR',
              primaryPhoneCallingCode: '+33',
              additionalPhones: [
                {
                  number: '123456789',
                  callingCode: '+44',
                  countryCode: 'GB',
                },
              ],
            },
          },
        ],
      });

      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );

      expect(createResponse.body.data.createPeople).toHaveLength(2);

      const createdPersonIds = createResponse.body.data.createPeople.map(
        ({ id }: { id: string }) => id,
      );

      createdPersonIdsForCleaning.push(...createdPersonIds);

      const mergeOperation = mergeManyOperationFactory({
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        ids: createdPersonIds,
        conflictPriorityIndex: 0,
      });

      const mergeResponse = await makeGraphqlAPIRequest(mergeOperation);

      expect(mergeResponse.body.errors).toBeUndefined();

      const mergedPerson = mergeResponse.body.data.mergePeople;

      expect(mergedPerson.phones.primaryPhoneNumber).toBe('5551234567');
      expect(mergedPerson.phones.primaryPhoneCountryCode).toBe('US');
      expect(mergedPerson.phones.primaryPhoneCallingCode).toBe('+1');
      expect(mergedPerson.phones.additionalPhones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ number: '4445556789' }),
          expect.objectContaining({ number: '5559876543' }),
          expect.objectContaining({ number: '4441112222' }),
        ]),
      );
      expect(mergedPerson.phones.additionalPhones).toHaveLength(3);

      expect(mergedPerson.whatsapp.primaryPhoneNumber).toBe('810407803');
      expect(mergedPerson.whatsapp.primaryPhoneCountryCode).toBe('FR');
      expect(mergedPerson.whatsapp.primaryPhoneCallingCode).toBe('+33');
      expect(mergedPerson.whatsapp.additionalPhones).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ number: '987654321' }),
          expect.objectContaining({ number: '8104078034' }),
          expect.objectContaining({ number: '123456789' }),
        ]),
      );
      expect(mergedPerson.whatsapp.additionalPhones).toHaveLength(3);
    });
  });
});
