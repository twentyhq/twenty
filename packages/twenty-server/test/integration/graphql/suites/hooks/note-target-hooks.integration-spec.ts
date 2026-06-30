import { randomUUID } from 'crypto';

import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

const NOTE_GQL_FIELDS = `
  id
  title
  deletedAt
`;

const NOTE_TARGET_GQL_FIELDS = `
  id
  noteId
  deletedAt
`;

describe('noteTargets hooks on note actions', () => {
  const noteIds: string[] = [];
  const noteTargetIds: string[] = [];

  afterAll(async () => {
    if (noteIds.length > 0) {
      const destroyNotesOperation = destroyManyOperationFactory({
        objectMetadataSingularName: 'note',
        objectMetadataPluralName: 'notes',
        gqlFields: 'id',
        filter: { id: { in: noteIds } },
      });

      await makeGraphqlAPIRequest(destroyNotesOperation);
    }

    if (noteTargetIds.length > 0) {
      const destroyNoteTargetsOperation = destroyManyOperationFactory({
        objectMetadataSingularName: 'noteTarget',
        objectMetadataPluralName: 'noteTargets',
        gqlFields: 'id',
        filter: { id: { in: noteTargetIds } },
      });

      await makeGraphqlAPIRequest(destroyNoteTargetsOperation);
    }
  });

  it('deleteOne note should soft delete related noteTargets', async () => {
    const noteId = randomUUID();
    const noteTargetId = randomUUID();

    noteIds.push(noteId);
    noteTargetIds.push(noteTargetId);

    await createOneOperation({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      input: { id: noteId, title: 'Test Note for DeleteOne' },
    });

    await createOneOperation({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      input: { id: noteTargetId, noteId },
    });

    const deleteNoteOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      recordId: noteId,
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteNoteOperation);

    expect(deleteResponse.body.data.deleteNote).toBeDefined();
    expect(deleteResponse.body.data.deleteNote.deletedAt).not.toBeNull();

    const findNoteTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: { eq: noteTargetId },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const noteTargetResponse = await makeGraphqlAPIRequest(
      findNoteTargetsOperation,
    );

    expect(noteTargetResponse.body.data.noteTargets.edges).toHaveLength(1);
    expect(
      noteTargetResponse.body.data.noteTargets.edges[0].node.deletedAt,
    ).not.toBeNull();
  });

  it('deleteMany notes should soft delete related noteTargets', async () => {
    const noteId1 = randomUUID();
    const noteId2 = randomUUID();
    const noteTargetId1 = randomUUID();
    const noteTargetId2 = randomUUID();

    noteIds.push(noteId1, noteId2);
    noteTargetIds.push(noteTargetId1, noteTargetId2);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'note',
        gqlFields: NOTE_GQL_FIELDS,
        input: { id: noteId1, title: 'Test Note 1 for DeleteMany' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'note',
        gqlFields: NOTE_GQL_FIELDS,
        input: { id: noteId2, title: 'Test Note 2 for DeleteMany' },
      }),
    ]);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'noteTarget',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        input: { id: noteTargetId1, noteId: noteId1 },
      }),
      createOneOperation({
        objectMetadataSingularName: 'noteTarget',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        input: { id: noteTargetId2, noteId: noteId2 },
      }),
    ]);

    const deleteNotesOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: { id: { in: [noteId1, noteId2] } },
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteNotesOperation);

    expect(deleteResponse.body.data.deleteNotes).toHaveLength(2);

    const findNoteTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: {
        id: { in: [noteTargetId1, noteTargetId2] },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const noteTargetResponse = await makeGraphqlAPIRequest(
      findNoteTargetsOperation,
    );

    expect(noteTargetResponse.body.data.noteTargets.edges).toHaveLength(2);
    expect(
      noteTargetResponse.body.data.noteTargets.edges[0].node.deletedAt,
    ).not.toBeNull();
    expect(
      noteTargetResponse.body.data.noteTargets.edges[1].node.deletedAt,
    ).not.toBeNull();
  });

  it('restoreOne note should restore related noteTargets', async () => {
    const noteId = randomUUID();
    const noteTargetId = randomUUID();

    noteIds.push(noteId);
    noteTargetIds.push(noteTargetId);

    await createOneOperation({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      input: { id: noteId, title: 'Test Note for RestoreOne' },
    });

    await createOneOperation({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      input: { id: noteTargetId, noteId },
    });

    const deleteNoteOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      recordId: noteId,
    });

    await makeGraphqlAPIRequest(deleteNoteOperation);

    const restoreNoteOperation = restoreOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      recordId: noteId,
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreNoteOperation);

    expect(restoreResponse.body.data.restoreNote).toBeDefined();
    expect(restoreResponse.body.data.restoreNote.deletedAt).toBeNull();

    const findNoteTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: { id: { eq: noteTargetId } },
    });

    const noteTargetResponse = await makeGraphqlAPIRequest(
      findNoteTargetsOperation,
    );

    expect(noteTargetResponse.body.data.noteTargets.edges).toHaveLength(1);
    expect(
      noteTargetResponse.body.data.noteTargets.edges[0].node.deletedAt,
    ).toBeNull();
  });

  it('restoreMany notes should restore related noteTargets', async () => {
    const noteId1 = randomUUID();
    const noteId2 = randomUUID();
    const noteTargetId1 = randomUUID();
    const noteTargetId2 = randomUUID();

    noteIds.push(noteId1, noteId2);
    noteTargetIds.push(noteTargetId1, noteTargetId2);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'note',
        gqlFields: NOTE_GQL_FIELDS,
        input: { id: noteId1, title: 'Test Note 1 for RestoreMany' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'note',
        gqlFields: NOTE_GQL_FIELDS,
        input: { id: noteId2, title: 'Test Note 2 for RestoreMany' },
      }),
    ]);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'noteTarget',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        input: { id: noteTargetId1, noteId: noteId1 },
      }),
      createOneOperation({
        objectMetadataSingularName: 'noteTarget',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        input: { id: noteTargetId2, noteId: noteId2 },
      }),
    ]);

    const deleteNotesOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: { id: { in: [noteId1, noteId2] } },
    });

    await makeGraphqlAPIRequest(deleteNotesOperation);

    const restoreNotesOperation = restoreManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: NOTE_GQL_FIELDS,
      filter: { id: { in: [noteId1, noteId2] } },
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreNotesOperation);

    expect(restoreResponse.body.data.restoreNotes).toHaveLength(2);

    const findNoteTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: { id: { in: [noteTargetId1, noteTargetId2] } },
    });

    const noteTargetResponse = await makeGraphqlAPIRequest(
      findNoteTargetsOperation,
    );

    expect(noteTargetResponse.body.data.noteTargets.edges).toHaveLength(2);
    expect(
      noteTargetResponse.body.data.noteTargets.edges[0].node.deletedAt,
    ).toBeNull();
    expect(
      noteTargetResponse.body.data.noteTargets.edges[1].node.deletedAt,
    ).toBeNull();
  });

  it('destroyOne note should destroy related noteTargets', async () => {
    const noteId = randomUUID();
    const noteTargetId = randomUUID();

    noteIds.push(noteId);

    await createOneOperation({
      objectMetadataSingularName: 'note',
      gqlFields: NOTE_GQL_FIELDS,
      input: { id: noteId, title: 'Test Note for DestroyOne' },
    });

    await createOneOperation({
      objectMetadataSingularName: 'noteTarget',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      input: { id: noteTargetId, noteId },
    });

    const destroyNoteOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'note',
      gqlFields: 'id',
      recordId: noteId,
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyNoteOperation);

    expect(destroyResponse.body.data.destroyNote).toBeDefined();

    const findNoteTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: { id: { eq: noteTargetId } },
    });

    const noteTargetResponse = await makeGraphqlAPIRequest(
      findNoteTargetsOperation,
    );

    expect(noteTargetResponse.body.data.noteTargets.edges).toHaveLength(0);
  });

  it('destroyMany notes should destroy related noteTargets', async () => {
    const noteId1 = randomUUID();
    const noteId2 = randomUUID();
    const noteTargetId1 = randomUUID();
    const noteTargetId2 = randomUUID();

    noteIds.push(noteId1, noteId2);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'note',
        gqlFields: NOTE_GQL_FIELDS,
        input: { id: noteId1, title: 'Test Note 1 for DestroyMany' },
      }),
      createOneOperation({
        objectMetadataSingularName: 'note',
        gqlFields: NOTE_GQL_FIELDS,
        input: { id: noteId2, title: 'Test Note 2 for DestroyMany' },
      }),
    ]);

    await Promise.all([
      createOneOperation({
        objectMetadataSingularName: 'noteTarget',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        input: { id: noteTargetId1, noteId: noteId1 },
      }),
      createOneOperation({
        objectMetadataSingularName: 'noteTarget',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        input: { id: noteTargetId2, noteId: noteId2 },
      }),
    ]);

    const destroyNotesOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: 'id',
      filter: { id: { in: [noteId1, noteId2] } },
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyNotesOperation);

    expect(destroyResponse.body.data.destroyNotes).toHaveLength(2);

    const findNoteTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      gqlFields: NOTE_TARGET_GQL_FIELDS,
      filter: { id: { in: [noteTargetId1, noteTargetId2] } },
    });

    const noteTargetResponse = await makeGraphqlAPIRequest(
      findNoteTargetsOperation,
    );

    expect(noteTargetResponse.body.data.noteTargets.edges).toHaveLength(0);
  });
});
