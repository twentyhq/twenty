import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFileWithDirectUpload } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FieldMetadataType } from 'twenty-shared/types';

const createRecordMutation = gql`
  mutation CreateRichTextFileSyncTestObject(
    $data: RichTextFileSyncTestObjectCreateInput!
  ) {
    createRichTextFileSyncTestObject(data: $data) {
      id
    }
  }
`;

const updateRecordMutation = gql`
  mutation UpdateRichTextFileSyncTestObject(
    $id: UUID!
    $data: RichTextFileSyncTestObjectUpdateInput!
  ) {
    updateRichTextFileSyncTestObject(id: $id, data: $data) {
      id
    }
  }
`;

const destroyRecordMutation = gql`
  mutation DestroyRichTextFileSyncTestObject($id: UUID!) {
    destroyRichTextFileSyncTestObject(id: $id) {
      id
    }
  }
`;

type FileRow = {
  recordId: string | null;
  deletedAt: string | null;
  settings: { isTemporaryFile: boolean };
};

const buildBody = (fileIds: string[]) => ({
  tiptap: JSON.stringify({
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Notes' }] },
      ...fileIds.map((fileId) => ({
        type: 'image',
        attrs: { src: `http://localhost:3000/file/files-field/${fileId}` },
      })),
    ],
  }),
});

const findFileRow = async (fileId: string): Promise<FileRow | undefined> => {
  const [fileRow] = await global.testDataSource.query(
    'SELECT "recordId", "deletedAt", "settings" FROM core."file" WHERE id = $1',
    [fileId],
  );

  return fileRow;
};

describe('Rich text field <> files sync', () => {
  let objectMetadataId = '';
  let richTextFieldMetadataId = '';
  let filesFieldMetadataId = '';

  const uploadFile = async (fieldMetadataId: string): Promise<string> => {
    const { id } = await uploadFileWithDirectUpload({
      filename: 'screenshot.txt',
      content: Buffer.from('fake content'),
      fileFolder: 'FilesField',
      fieldMetadataId,
    });

    return id;
  };

  const createRecord = async (fileIds: string[]): Promise<string> => {
    const response = await makeGraphqlApiRequest({
      query: createRecordMutation,
      variables: { data: { name: 'Meeting', body: buildBody(fileIds) } },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.createRichTextFileSyncTestObject.id;
  };

  const updateRecordBody = async ({
    id,
    fileIds,
  }: {
    id: string;
    fileIds: string[];
  }) => {
    const response = await makeGraphqlApiRequest({
      query: updateRecordMutation,
      variables: { id, data: { body: buildBody(fileIds) } },
    });

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'richTextFileSyncTestObject',
        namePlural: 'richTextFileSyncTestObjects',
        labelSingular: 'Rich Text File Sync Test Object',
        labelPlural: 'Rich Text File Sync Test Objects',
        icon: 'IconFile',
      },
    });

    objectMetadataId = createOneObject.id;

    const {
      data: { createOneField: richTextField },
    } = await createOneFieldMetadata({
      input: {
        name: 'body',
        label: 'Body',
        type: FieldMetadataType.RICH_TEXT,
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    richTextFieldMetadataId = richTextField.id;

    const {
      data: { createOneField: filesField },
    } = await createOneFieldMetadata({
      input: {
        name: 'documents',
        label: 'Documents',
        type: FieldMetadataType.FILES,
        objectMetadataId,
        settings: { maxNumberOfValues: 5 },
      },
      gqlFields: 'id',
    });

    filesFieldMetadataId = filesField.id;
  });

  afterAll(async () => {
    jest.useFakeTimers();

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: objectMetadataId },
    });
  });

  it('should keep the files uploaded for the field that a created body references', async () => {
    const fileId = await uploadFile(richTextFieldMetadataId);

    const recordId = await createRecord([fileId]);

    expect(await findFileRow(fileId)).toMatchObject({
      recordId,
      deletedAt: null,
      settings: { isTemporaryFile: false },
    });
  });

  it('should keep a file added by an update and release it once the body stops referencing it', async () => {
    const recordId = await createRecord([]);
    const fileId = await uploadFile(richTextFieldMetadataId);

    await updateRecordBody({ id: recordId, fileIds: [fileId] });

    expect(await findFileRow(fileId)).toMatchObject({
      recordId,
      deletedAt: null,
      settings: { isTemporaryFile: false },
    });

    await updateRecordBody({ id: recordId, fileIds: [] });

    expect((await findFileRow(fileId))?.deletedAt).not.toBeNull();
  });

  it('should restore a released file when the body references it again', async () => {
    const fileId = await uploadFile(richTextFieldMetadataId);
    const recordId = await createRecord([fileId]);

    await updateRecordBody({ id: recordId, fileIds: [] });
    await updateRecordBody({ id: recordId, fileIds: [fileId] });

    expect(await findFileRow(fileId)).toMatchObject({
      recordId,
      deletedAt: null,
    });
  });

  it('should hand a released file over to the next record that references it', async () => {
    const fileId = await uploadFile(richTextFieldMetadataId);
    const firstRecordId = await createRecord([fileId]);
    const secondRecordId = await createRecord([]);

    await updateRecordBody({ id: firstRecordId, fileIds: [] });
    await updateRecordBody({ id: secondRecordId, fileIds: [fileId] });

    expect(await findFileRow(fileId)).toMatchObject({
      recordId: secondRecordId,
      deletedAt: null,
    });
  });

  it('should leave a file owned by another record untouched', async () => {
    const fileId = await uploadFile(richTextFieldMetadataId);
    const ownerRecordId = await createRecord([fileId]);
    const otherRecordId = await createRecord([fileId]);

    await updateRecordBody({ id: otherRecordId, fileIds: [] });

    expect(await findFileRow(fileId)).toMatchObject({
      recordId: ownerRecordId,
      deletedAt: null,
    });
  });

  it('should not claim a file uploaded for the field before uploads carried an expiry', async () => {
    const fileId = await uploadFile(richTextFieldMetadataId);

    await global.testDataSource.query(
      `UPDATE core."file" SET "settings" = "settings" - 'expiresAt' WHERE id = $1`,
      [fileId],
    );

    const recordId = await createRecord([fileId]);

    await updateRecordBody({ id: recordId, fileIds: [] });

    expect(await findFileRow(fileId)).toMatchObject({
      recordId: null,
      deletedAt: null,
      settings: { isTemporaryFile: true },
    });
  });

  it('should leave a file uploaded for another field untouched', async () => {
    const fileId = await uploadFile(filesFieldMetadataId);
    const recordId = await createRecord([fileId]);

    await updateRecordBody({ id: recordId, fileIds: [] });

    expect(await findFileRow(fileId)).toMatchObject({
      recordId: null,
      deletedAt: null,
      settings: { isTemporaryFile: true },
    });
  });

  it('should delete the files a destroyed record owns', async () => {
    const ownedFileId = await uploadFile(richTextFieldMetadataId);
    const foreignFileId = await uploadFile(richTextFieldMetadataId);

    const ownerRecordId = await createRecord([foreignFileId]);
    const destroyedRecordId = await createRecord([ownedFileId, foreignFileId]);

    const response = await makeGraphqlApiRequest({
      query: destroyRecordMutation,
      variables: { id: destroyedRecordId },
    });

    expect(response.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    expect(await findFileRow(ownedFileId)).toBeUndefined();
    expect(await findFileRow(foreignFileId)).toMatchObject({
      recordId: ownerRecordId,
      deletedAt: null,
    });
  });
});
