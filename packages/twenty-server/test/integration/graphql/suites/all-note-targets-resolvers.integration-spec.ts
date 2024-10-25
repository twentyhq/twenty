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

const NOTE_TARGET_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const NOTE_TARGET_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const NOTE_TARGET_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const PERSON_1_ID = '777a8457-eb2d-40ac-a707-441b615b6989';
const PERSON_2_ID = '777a8457-eb2d-40ac-a707-331b615b6989';
const NOTE_TARGET_GQL_FIELDS = `
    id
    createdAt
    deletedAt
    noteId
    personId
    companyId
    opportunityId
    person{
      id
    }
`;

describe('noteTargets resolvers (integration)', () => {
  beforeAll(async () => {
    const personName1 = generateRecordName(PERSON_1_ID);
    const personName2 = generateRecordName(PERSON_2_ID);
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `id`,
      data: [
        {
          id: PERSON_1_ID,
          name: {
            firstName: personName1,
            lastName: personName1,
          },
        },
        {
          id: PERSON_2_ID,
          name: {
            firstName: personName2,
            lastName: personName2,
          },
        },
      ],
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  afterAll(async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `id`,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
      },
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });
  it('1. should create and return noteTargets', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      data: [
        {
          id: NOTE_TARGET_1_ID,
        },
        {
          id: NOTE_TARGET_2_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createNoteTargets).toHaveLength(2);

    response.body.data.createNoteTargets.forEach((noteTarget) => {
      expect(noteTarget).toHaveProperty('id');
      expect(noteTarget).toHaveProperty('createdAt');
      expect(noteTarget).toHaveProperty('deletedAt');
      expect(noteTarget).toHaveProperty('noteId');
      expect(noteTarget).toHaveProperty('personId');
      expect(noteTarget).toHaveProperty('companyId');
      expect(noteTarget).toHaveProperty('opportunityId');
      expect(noteTarget).toHaveProperty('person');
    });
  });

  it('1b. should create and return one noteTarget', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      data: {
        id: NOTE_TARGET_3_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdNoteTarget = response.body.data.createNoteTarget;

    expect(createdNoteTarget).toHaveProperty('id');
    expect(createdNoteTarget).toHaveProperty('createdAt');
    expect(createdNoteTarget).toHaveProperty('deletedAt');
    expect(createdNoteTarget).toHaveProperty('noteId');
    expect(createdNoteTarget).toHaveProperty('personId');
    expect(createdNoteTarget).toHaveProperty('companyId');
    expect(createdNoteTarget).toHaveProperty('opportunityId');
    expect(createdNoteTarget).toHaveProperty('person');
  });

  it('2. should find many noteTargets', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.noteTargets;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const noteTarget = edges[0].node;

      expect(noteTarget).toHaveProperty('id');
      expect(noteTarget).toHaveProperty('createdAt');
      expect(noteTarget).toHaveProperty('deletedAt');
      expect(noteTarget).toHaveProperty('noteId');
      expect(noteTarget).toHaveProperty('personId');
      expect(noteTarget).toHaveProperty('companyId');
      expect(noteTarget).toHaveProperty('opportunityId');
      expect(noteTarget).toHaveProperty('person');
    }
  });

  it('2b. should find one noteTarget', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_TARGET_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const noteTarget = response.body.data.noteTarget;

    expect(noteTarget).toHaveProperty('id');
    expect(noteTarget).toHaveProperty('createdAt');
    expect(noteTarget).toHaveProperty('deletedAt');
    expect(noteTarget).toHaveProperty('noteId');
    expect(noteTarget).toHaveProperty('personId');
    expect(noteTarget).toHaveProperty('companyId');
    expect(noteTarget).toHaveProperty('opportunityId');
    expect(noteTarget).toHaveProperty('person');
  });

  it('3. should update many noteTargets', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      data: {
        personId: PERSON_1_ID,
      },
      filter: {
        id: {
          in: [NOTE_TARGET_1_ID, NOTE_TARGET_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedNoteTargets = response.body.data.updateNoteTargets;

    expect(updatedNoteTargets).toHaveLength(2);

    updatedNoteTargets.forEach((noteTarget) => {
      expect(noteTarget.person.id).toEqual(PERSON_1_ID);
    });
  });

  it('3b. should update one noteTarget', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      data: {
        personId: PERSON_2_ID,
      },
      recordId: NOTE_TARGET_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedNoteTarget = response.body.data.updateNoteTarget;

    expect(updatedNoteTarget.person.id).toEqual(PERSON_2_ID);
  });

  it('4. should find many noteTargets with updated personId', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        personId: {
          eq: PERSON_1_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTargets.edges).toHaveLength(2);
  });

  it('4b. should find one noteTarget with updated personId', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        personId: {
          eq: PERSON_2_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTarget.person.id).toEqual(PERSON_2_ID);
  });

  it('5. should delete many noteTargets', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_TARGET_1_ID, NOTE_TARGET_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteNoteTargets = response.body.data.deleteNoteTargets;

    expect(deleteNoteTargets).toHaveLength(2);

    deleteNoteTargets.forEach((noteTarget) => {
      expect(noteTarget.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one noteTarget', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      recordId: NOTE_TARGET_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteNoteTarget.deletedAt).toBeTruthy();
  });

  it('6. should not find many noteTargets anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_TARGET_1_ID, NOTE_TARGET_2_ID],
        },
      },
    });

    const findNoteTargetsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(findNoteTargetsResponse.body.data.noteTargets.edges).toHaveLength(0);
  });

  it('6b. should not find one noteTarget anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_TARGET_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTarget).toBeNull();
  });

  it('7. should find many deleted noteTargets with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_TARGET_1_ID, NOTE_TARGET_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTargets.edges).toHaveLength(2);
  });

  it('7b. should find one deleted noteTarget with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_TARGET_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTarget.id).toEqual(NOTE_TARGET_3_ID);
  });

  it('8. should destroy many noteTargets', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_TARGET_1_ID, NOTE_TARGET_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyNoteTargets).toHaveLength(2);
  });

  it('8b. should destroy one noteTarget', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      recordId: NOTE_TARGET_3_ID,
    });

    const destroyNoteTargetsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyNoteTargetsResponse.body.data.destroyNoteTarget).toBeTruthy();
  });

  it('9. should not find many noteTargets anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_TARGET_1_ID, NOTE_TARGET_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTargets.edges).toHaveLength(0);
  });

  it('9b. should not find one noteTarget anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_TARGET_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.noteTarget).toBeNull();
  });
});
