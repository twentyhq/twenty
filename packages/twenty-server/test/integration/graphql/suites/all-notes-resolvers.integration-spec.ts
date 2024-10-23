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

const NOTE_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const NOTE_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const NOTE_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const NOTE_GQL_FIELDS = `
    id
    title
    createdAt
    updatedAt
    deletedAt
    body
    position    
`;

describe('notes resolvers (integration)', () => {
  it('1. should create and return notes', async () => {
    const noteTitle1 = generateRecordName(NOTE_1_ID);
    const noteTitle2 = generateRecordName(NOTE_2_ID);
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      data: [
        {
          id: NOTE_1_ID,
          title: noteTitle1,
        },
        {
          id: NOTE_2_ID,
          title: noteTitle2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createNotes).toHaveLength(2);

    response.body.data.createNotes.forEach((note) => {
      expect(note).toHaveProperty('title');
      expect([noteTitle1, noteTitle2]).toContain(note.title);

      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('updatedAt');
      expect(note).toHaveProperty('deletedAt');
      expect(note).toHaveProperty('body');
      expect(note).toHaveProperty('position');
    });
  });

  it('1b. should create and return one note', async () => {
    const noteTitle3 = generateRecordName(NOTE_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      data: {
        id: NOTE_3_ID,
        title: noteTitle3,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdNote = response.body.data.createNote;

    expect(createdNote).toHaveProperty('title');
    expect(createdNote.title).toEqual(noteTitle3);

    expect(createdNote).toHaveProperty('id');
    expect(createdNote).toHaveProperty('createdAt');
    expect(createdNote).toHaveProperty('updatedAt');
    expect(createdNote).toHaveProperty('deletedAt');
    expect(createdNote).toHaveProperty('body');
    expect(createdNote).toHaveProperty('position');
  });

  it('2. should find many notes', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.notes;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const note = edges[0].node;

      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('updatedAt');
      expect(note).toHaveProperty('deletedAt');
      expect(note).toHaveProperty('body');
      expect(note).toHaveProperty('position');
    }
  });

  it('2b. should find one note', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const note = response.body.data.note;

    expect(note).toHaveProperty('title');

    expect(note).toHaveProperty('id');
    expect(note).toHaveProperty('createdAt');
    expect(note).toHaveProperty('updatedAt');
    expect(note).toHaveProperty('deletedAt');
    expect(note).toHaveProperty('body');
    expect(note).toHaveProperty('position');
  });

  it('3. should update many notes', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      data: {
        title: 'Updated Title',
      },
      filter: {
        id: {
          in: [NOTE_1_ID, NOTE_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedNotes = response.body.data.updateNotes;

    expect(updatedNotes).toHaveLength(2);

    updatedNotes.forEach((note) => {
      expect(note.title).toEqual('Updated Title');
    });
  });

  it('3b. should update one note', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      data: {
        title: 'New Title',
      },
      recordId: NOTE_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedNote = response.body.data.updateNote;

    expect(updatedNote.title).toEqual('New Title');
  });

  it('4. should find many notes with updated title', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        title: {
          eq: 'Updated Title',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.notes.edges).toHaveLength(2);
  });

  it('4b. should find one note with updated title', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        title: {
          eq: 'New Title',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.note.title).toEqual('New Title');
  });

  it('5. should delete many notes', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_1_ID, NOTE_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteNotes = response.body.data.deleteNotes;

    expect(deleteNotes).toHaveLength(2);

    deleteNotes.forEach((note) => {
      expect(note.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one note', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      recordId: NOTE_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteNote.deletedAt).toBeTruthy();
  });

  it('6. should not find many notes anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_1_ID, NOTE_2_ID],
        },
      },
    });

    const findNotesResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findNotesResponse.body.data.notes.edges).toHaveLength(0);
  });

  it('6b. should not find one note anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.note).toBeNull();
  });

  it('7. should find many deleted notes with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_1_ID, NOTE_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.notes.edges).toHaveLength(2);
  });

  it('7b. should find one deleted note with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.note.id).toEqual(NOTE_3_ID);
  });

  it('8. should destroy many notes', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_1_ID, NOTE_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyNotes).toHaveLength(2);
  });

  it('8b. should destroy one note', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      recordId: NOTE_3_ID,
    });

    const destroyNotesResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyNotesResponse.body.data.destroyNote).toBeTruthy();
  });

  it('9. should not find many notes anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          in: [NOTE_1_ID, NOTE_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.notes.edges).toHaveLength(0);
  });

  it('9b. should not find one note anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      filter: {
        id: {
          eq: NOTE_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.note).toBeNull();
  });
});
