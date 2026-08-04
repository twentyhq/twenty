import { randomUUID } from 'crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('people merge resolvers (integration)', () => {
  let createdPersonIdsForCleaning: string[] = [];
  let createdOpportunityIdsForCleaning: string[] = [];
  let createdNoteIdsForCleaning: string[] = [];
  let createdNoteTargetIdsForCleaning: string[] = [];
  let createdTimelineActivityIdsForCleaning: string[] = [];

  afterEach(async () => {
    await deleteRecordsByIds(
      'timelineActivity',
      createdTimelineActivityIdsForCleaning,
    );
    await deleteRecordsByIds('noteTarget', createdNoteTargetIdsForCleaning);
    await deleteRecordsByIds('note', createdNoteIdsForCleaning);
    await deleteRecordsByIds('opportunity', createdOpportunityIdsForCleaning);

    if (createdPersonIdsForCleaning.length > 0) {
      await global.testDataSource.query(
        'DELETE FROM core."personRecordMerge" WHERE "sourcePersonId" = ANY($1)',
        [createdPersonIdsForCleaning],
      );
      await deleteRecordsByIds('person', createdPersonIdsForCleaning);
    }

    createdOpportunityIdsForCleaning = [];
    createdNoteIdsForCleaning = [];
    createdNoteTargetIdsForCleaning = [];
    createdTimelineActivityIdsForCleaning = [];
    createdPersonIdsForCleaning = [];
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

    it('should apply reviewed contact values, trash absorbed people, and record provenance', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: {
              firstName: 'Merge',
              lastName: 'Survivor',
            },
            emails: {
              primaryEmail: 'survivor@example.com',
              additionalEmails: [],
            },
          },
          {
            name: {
              firstName: 'Merge',
              lastName: 'Absorbed',
            },
            emails: {
              primaryEmail: 'absorbed@example.com',
              additionalEmails: [],
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
      const [survivorPersonId, absorbedPersonId] = createdPersonIds;

      createdPersonIdsForCleaning.push(...createdPersonIds);

      const mergeOperation = mergeManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        ids: createdPersonIds,
        conflictPriorityIndex: 0,
        data: {
          emails: {
            primaryEmail: 'absorbed@example.com',
            additionalEmails: ['survivor@example.com'],
          },
        },
      });
      const mergeResponse = await makeGraphqlAPIRequest(mergeOperation);

      expect(mergeResponse.body.errors).toBeUndefined();
      expect(mergeResponse.body.data.mergePeople.id).toBe(survivorPersonId);
      expect(mergeResponse.body.data.mergePeople.emails).toEqual({
        primaryEmail: 'absorbed@example.com',
        additionalEmails: ['survivor@example.com'],
      });

      const findAbsorbedPerson = findOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        filter: {
          id: {
            eq: absorbedPersonId,
          },
          not: {
            deletedAt: {
              is: 'NULL',
            },
          },
        },
      });
      const findAbsorbedPersonResponse =
        await makeGraphqlAPIRequest(findAbsorbedPerson);

      expect(findAbsorbedPersonResponse.body.data.person.id).toBe(
        absorbedPersonId,
      );
      expect(
        findAbsorbedPersonResponse.body.data.person.deletedAt,
      ).not.toBeNull();

      const provenanceRows = await global.testDataSource.query(
        'SELECT "mergedByWorkspaceMemberId" FROM core."personRecordMerge" WHERE "sourcePersonId" = $1 AND "targetPersonId" = $2',
        [absorbedPersonId, survivorPersonId],
      );

      expect(provenanceRows).toHaveLength(1);
      expect(provenanceRows[0].mergedByWorkspaceMemberId).toBeTruthy();
    });

    it('should clear absorbed emails across sequential and multi-person merges', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: { firstName: 'First', lastName: 'Survivor' },
            emails: {
              primaryEmail: 'first-survivor@example.com',
              additionalEmails: [],
            },
          },
          {
            name: { firstName: 'First', lastName: 'Absorbed' },
            emails: {
              primaryEmail: 'first-absorbed@example.com',
              additionalEmails: ['first-absorbed-alt@example.com'],
            },
          },
          {
            name: { firstName: 'Second', lastName: 'Survivor' },
            emails: {
              primaryEmail: 'second-survivor@example.com',
              additionalEmails: [],
            },
          },
          {
            name: { firstName: 'Second', lastName: 'AbsorbedOne' },
            emails: {
              primaryEmail: 'second-absorbed-one@example.com',
              additionalEmails: ['second-absorbed-one-alt@example.com'],
            },
          },
          {
            name: { firstName: 'Second', lastName: 'AbsorbedTwo' },
            emails: {
              primaryEmail: 'second-absorbed-two@example.com',
              additionalEmails: ['second-absorbed-two-alt@example.com'],
            },
          },
        ],
      });
      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );
      const createdPeople = createResponse.body.data.createPeople as Array<{
        id: string;
      }>;
      const createdPersonIds = createdPeople.map(({ id }) => id);

      createdPersonIdsForCleaning.push(...createdPersonIds);

      const firstMergeResponse = await makeGraphqlAPIRequest(
        mergeManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: createdPersonIds.slice(0, 2),
          conflictPriorityIndex: 0,
          data: {
            emails: {
              primaryEmail: 'first-absorbed@example.com',
              additionalEmails: ['first-survivor@example.com'],
            },
          },
        }),
      );

      expect(firstMergeResponse.body.errors).toBeUndefined();
      expect(firstMergeResponse.body.data.mergePeople.emails.primaryEmail).toBe(
        'first-absorbed@example.com',
      );

      const secondMergeResponse = await makeGraphqlAPIRequest(
        mergeManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: createdPersonIds.slice(2),
          conflictPriorityIndex: 0,
          data: {
            emails: {
              primaryEmail: 'second-absorbed-two@example.com',
              additionalEmails: [
                'second-survivor@example.com',
                'second-absorbed-one@example.com',
              ],
            },
          },
        }),
      );

      expect(secondMergeResponse.body.errors).toBeUndefined();
      expect(
        secondMergeResponse.body.data.mergePeople.emails.primaryEmail,
      ).toBe('second-absorbed-two@example.com');

      for (const absorbedPersonId of [
        createdPersonIds[1],
        createdPersonIds[3],
        createdPersonIds[4],
      ]) {
        const findAbsorbedPersonResponse = await makeGraphqlAPIRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            filter: {
              id: { eq: absorbedPersonId },
              not: { deletedAt: { is: 'NULL' } },
            },
          }),
        );

        expect(findAbsorbedPersonResponse.body.errors).toBeUndefined();
        expect(
          findAbsorbedPersonResponse.body.data.person.deletedAt,
        ).not.toBeNull();
        expect(findAbsorbedPersonResponse.body.data.person.emails).toEqual({
          primaryEmail: '',
          additionalEmails: [],
        });
      }
    });

    it('should only remove source interactions with an exact survivor equivalent', async () => {
      const personResponse = await makeGraphqlAPIRequest(
        createManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          data: [
            {
              name: { firstName: 'Timeline', lastName: 'Survivor' },
              emails: {
                primaryEmail: 'timeline-survivor@example.com',
                additionalEmails: [],
              },
            },
            {
              name: { firstName: 'Timeline', lastName: 'Absorbed' },
              emails: {
                primaryEmail: 'timeline-absorbed@example.com',
                additionalEmails: [],
              },
            },
          ],
        }),
      );
      const [survivorPersonId, absorbedPersonId] =
        personResponse.body.data.createPeople.map(
          ({ id }: { id: string }) => id,
        );

      createdPersonIdsForCleaning.push(survivorPersonId, absorbedPersonId);

      const duplicatedNoteId = randomUUID();
      const sourceOnlyNoteId = randomUUID();
      const survivorNoteTargetId = randomUUID();
      const redundantSourceNoteTargetId = randomUUID();
      const retainedSourceNoteTargetId = randomUUID();

      createdNoteIdsForCleaning.push(duplicatedNoteId, sourceOnlyNoteId);
      createdNoteTargetIdsForCleaning.push(
        survivorNoteTargetId,
        redundantSourceNoteTargetId,
        retainedSourceNoteTargetId,
      );

      await Promise.all([
        createOneOperation({
          objectMetadataSingularName: 'note',
          input: { id: duplicatedNoteId, title: 'Shared merge test note' },
        }),
        createOneOperation({
          objectMetadataSingularName: 'note',
          input: { id: sourceOnlyNoteId, title: 'Source-only merge test note' },
        }),
      ]);

      await Promise.all([
        createOneOperation({
          objectMetadataSingularName: 'noteTarget',
          input: {
            id: survivorNoteTargetId,
            noteId: duplicatedNoteId,
            targetPersonId: survivorPersonId,
          },
        }),
        createOneOperation({
          objectMetadataSingularName: 'noteTarget',
          input: {
            id: redundantSourceNoteTargetId,
            noteId: duplicatedNoteId,
            targetPersonId: absorbedPersonId,
          },
        }),
        createOneOperation({
          objectMetadataSingularName: 'noteTarget',
          input: {
            id: retainedSourceNoteTargetId,
            noteId: sourceOnlyNoteId,
            targetPersonId: absorbedPersonId,
          },
        }),
      ]);

      const survivorTimelineActivityId = randomUUID();
      const redundantSourceTimelineActivityId = randomUUID();
      const distinctSourceTimelineActivityId = randomUUID();
      const linkedRecordId = randomUUID();
      const duplicateHappensAt = '2026-07-01T12:00:00.000Z';

      createdTimelineActivityIdsForCleaning.push(
        survivorTimelineActivityId,
        redundantSourceTimelineActivityId,
        distinctSourceTimelineActivityId,
      );

      const createTimelineActivity = async ({
        id,
        targetPersonId,
        happensAt,
      }: {
        id: string;
        targetPersonId: string;
        happensAt: string;
      }) =>
        createOneOperation({
          objectMetadataSingularName: 'timelineActivity',
          input: {
            id,
            targetPersonId,
            happensAt,
            name: 'message.linked',
            properties: {},
            linkedRecordCachedName: '',
            linkedRecordId,
          },
        });

      await Promise.all([
        createTimelineActivity({
          id: survivorTimelineActivityId,
          targetPersonId: survivorPersonId,
          happensAt: duplicateHappensAt,
        }),
        createTimelineActivity({
          id: redundantSourceTimelineActivityId,
          targetPersonId: absorbedPersonId,
          happensAt: duplicateHappensAt,
        }),
        createTimelineActivity({
          id: distinctSourceTimelineActivityId,
          targetPersonId: absorbedPersonId,
          happensAt: '2026-07-01T12:01:00.000Z',
        }),
      ]);

      const mergeResponse = await makeGraphqlAPIRequest(
        mergeManyOperationFactory({
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: [survivorPersonId, absorbedPersonId],
          conflictPriorityIndex: 0,
        }),
      );

      expect(mergeResponse.body.errors).toBeUndefined();

      const noteTargetsResponse = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'noteTarget',
          objectMetadataPluralName: 'noteTargets',
          gqlFields: 'id noteId targetPersonId',
          filter: {
            id: {
              in: [
                survivorNoteTargetId,
                redundantSourceNoteTargetId,
                retainedSourceNoteTargetId,
              ],
            },
          },
        }),
      );
      const noteTargets = noteTargetsResponse.body.data.noteTargets.edges.map(
        ({ node }: { node: Record<string, string> }) => node,
      );

      expect(noteTargets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: survivorNoteTargetId,
            targetPersonId: survivorPersonId,
          }),
          expect.objectContaining({
            id: retainedSourceNoteTargetId,
            targetPersonId: survivorPersonId,
          }),
        ]),
      );
      expect(noteTargets).toHaveLength(2);

      const timelineActivitiesResponse = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'timelineActivity',
          objectMetadataPluralName: 'timelineActivities',
          gqlFields: 'id targetPersonId happensAt',
          filter: {
            id: {
              in: [
                survivorTimelineActivityId,
                redundantSourceTimelineActivityId,
                distinctSourceTimelineActivityId,
              ],
            },
          },
        }),
      );
      const timelineActivities =
        timelineActivitiesResponse.body.data.timelineActivities.edges.map(
          ({ node }: { node: Record<string, string> }) => node,
        );

      expect(timelineActivities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: survivorTimelineActivityId,
            targetPersonId: survivorPersonId,
          }),
          expect.objectContaining({
            id: distinctSourceTimelineActivityId,
            targetPersonId: survivorPersonId,
          }),
        ]),
      );
      expect(timelineActivities).toHaveLength(2);
    });

    it('should restore an absorbed person without reclaiming migrated relationships', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: { firstName: 'Restore', lastName: 'Survivor' },
            emails: {
              primaryEmail: 'restore-survivor@example.com',
              additionalEmails: [],
            },
          },
          {
            name: { firstName: 'Restore', lastName: 'Absorbed' },
            emails: {
              primaryEmail: 'restore-absorbed@example.com',
              additionalEmails: [],
            },
          },
        ],
      });
      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );
      const [survivorPersonId, absorbedPersonId] =
        createResponse.body.data.createPeople.map(
          ({ id }: { id: string }) => id,
        );

      createdPersonIdsForCleaning.push(survivorPersonId, absorbedPersonId);

      const opportunityResponse = await createOneOperation({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id pointOfContactId',
        input: {
          name: 'Relationship retained by merge survivor',
          pointOfContactId: absorbedPersonId,
        },
      });
      const opportunityId = opportunityResponse.data.createOneResponse.id;

      createdOpportunityIdsForCleaning.push(opportunityId);

      const mergeResponse = await makeGraphqlAPIRequest(
        mergeManyOperationFactory({
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: [survivorPersonId, absorbedPersonId],
          conflictPriorityIndex: 0,
        }),
      );

      expect(mergeResponse.body.errors).toBeUndefined();

      const restoreResponse = await makeGraphqlAPIRequest(
        restoreOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: absorbedPersonId,
        }),
      );

      expect(restoreResponse.body.errors).toBeUndefined();
      expect(restoreResponse.body.data.restorePerson.deletedAt).toBeNull();
      expect(restoreResponse.body.data.restorePerson.emails).toEqual({
        primaryEmail: '',
        additionalEmails: [],
      });

      const findOpportunityResponse = await makeGraphqlAPIRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id pointOfContactId',
          filter: { id: { eq: opportunityId } },
        }),
      );

      expect(findOpportunityResponse.body.errors).toBeUndefined();
      expect(
        findOpportunityResponse.body.data.opportunity.pointOfContactId,
      ).toBe(survivorPersonId);
    });

    it('should roll back relationship moves, deletion, and updates when the survivor update fails', async () => {
      const createPersonsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
        data: [
          {
            name: { firstName: 'Rollback', lastName: 'Survivor' },
            emails: {
              primaryEmail: 'rollback-survivor@example.com',
              additionalEmails: [],
            },
          },
          {
            name: { firstName: 'Rollback', lastName: 'Absorbed' },
            emails: {
              primaryEmail: 'rollback-absorbed@example.com',
              additionalEmails: [],
            },
          },
          {
            name: { firstName: 'Rollback', lastName: 'Conflict' },
            emails: {
              primaryEmail: 'rollback-conflict@example.com',
              additionalEmails: [],
            },
          },
        ],
      });
      const createResponse = await makeGraphqlAPIRequest(
        createPersonsOperation,
      );
      const [survivorPersonId, absorbedPersonId, conflictingPersonId] =
        createResponse.body.data.createPeople.map(
          ({ id }: { id: string }) => id,
        );

      createdPersonIdsForCleaning.push(
        survivorPersonId,
        absorbedPersonId,
        conflictingPersonId,
      );

      const opportunityResponse = await createOneOperation({
        objectMetadataSingularName: 'opportunity',
        gqlFields: 'id pointOfContactId',
        input: {
          name: 'Relationship protected by merge rollback',
          pointOfContactId: absorbedPersonId,
        },
      });
      const opportunityId = opportunityResponse.data.createOneResponse.id;

      createdOpportunityIdsForCleaning.push(opportunityId);

      const mergeResponse = await makeGraphqlAPIRequest(
        mergeManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: PERSON_GQL_FIELDS,
          ids: [survivorPersonId, absorbedPersonId],
          conflictPriorityIndex: 0,
          data: {
            emails: {
              primaryEmail: 'rollback-conflict@example.com',
              additionalEmails: [],
            },
          },
        }),
      );

      expect(mergeResponse.body.errors).toBeDefined();

      for (const [personId, primaryEmail] of [
        [survivorPersonId, 'rollback-survivor@example.com'],
        [absorbedPersonId, 'rollback-absorbed@example.com'],
      ]) {
        const findPersonResponse = await makeGraphqlAPIRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: PERSON_GQL_FIELDS,
            filter: { id: { eq: personId } },
          }),
        );

        expect(findPersonResponse.body.errors).toBeUndefined();
        expect(findPersonResponse.body.data.person.deletedAt).toBeNull();
        expect(findPersonResponse.body.data.person.emails.primaryEmail).toBe(
          primaryEmail,
        );
      }

      const findOpportunityResponse = await makeGraphqlAPIRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'opportunity',
          gqlFields: 'id pointOfContactId',
          filter: { id: { eq: opportunityId } },
        }),
      );

      expect(findOpportunityResponse.body.errors).toBeUndefined();
      expect(
        findOpportunityResponse.body.data.opportunity.pointOfContactId,
      ).toBe(absorbedPersonId);
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
