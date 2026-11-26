import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFileWithDirectUpload } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FieldMetadataType } from 'twenty-shared/types';

const RECORD_GQL_FIELDS = `
  id
  body {
    markdown
    files {
      fileId
      label
      extension
      url
    }
  }
`;

const createRecordMutation = gql`
  mutation CreateRichTextFilesTestObject(
    $data: RichTextFilesTestObjectCreateInput!
  ) {
    createRichTextFilesTestObject(data: $data) {
      ${RECORD_GQL_FIELDS}
    }
  }
`;

const updateRecordMutation = gql`
  mutation UpdateRichTextFilesTestObject(
    $id: UUID!
    $data: RichTextFilesTestObjectUpdateInput!
  ) {
    updateRichTextFilesTestObject(id: $id, data: $data) {
      ${RECORD_GQL_FIELDS}
    }
  }
`;

const destroyRecordMutation = gql`
  mutation DestroyRichTextFilesTestObject($id: UUID!) {
    destroyRichTextFilesTestObject(id: $id) {
      id
    }
  }
`;

type FileRow = {
  deletedAt: string | null;
  settings: { isTemporaryFile: boolean };
};

const findFileRow = async (fileId: string): Promise<FileRow | undefined> => {
  const [fileRow] = await global.testDataSource.query(
    'SELECT "deletedAt", "settings" FROM core."file" WHERE id = $1',
    [fileId],
  );

  return fileRow;
};

describe('Rich text field files sub-field <> files sync', () => {
  let objectMetadataId = '';
  let bodyFieldMetadataId = '';
  let summaryFieldMetadataId = '';

  const uploadFile = async (fieldMetadataId: string): Promise<string> => {
    const uploadedFile = await uploadFileWithDirectUpload({
      filename: 'notes.txt',
      content: Buffer.from('fake text content'),
      fileFolder: 'FilesField',
      fieldMetadataId,
    });

    return uploadedFile.id;
  };

  const createRecord = (fileIds: string[]) =>
    makeGraphqlApiRequest({
      query: createRecordMutation,
      variables: {
        data: {
          body: {
            markdown: 'Notes',
            files: fileIds.map((fileId) => ({ fileId, label: 'notes.txt' })),
          },
        },
      },
    });

  const updateRecord = ({
    id,
    body,
  }: {
    id: string;
    body: Record<string, unknown>;
  }) =>
    makeGraphqlApiRequest({
      query: updateRecordMutation,
      variables: { id, data: { body } },
    });

  beforeAll(async () => {
    jest.useRealTimers();

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'richTextFilesTestObject',
        namePlural: 'richTextFilesTestObjects',
        labelSingular: 'Rich Text Files Test Object',
        labelPlural: 'Rich Text Files Test Objects',
        icon: 'IconFile',
      },
    });

    objectMetadataId = createOneObject.id;

    const createRichTextField = async (name: string) => {
      const {
        data: { createOneField },
      } = await createOneFieldMetadata({
        input: {
          name,
          label: name,
          type: FieldMetadataType.RICH_TEXT,
          objectMetadataId,
        },
        gqlFields: 'id',
      });

      return createOneField.id;
    };

    bodyFieldMetadataId = await createRichTextField('body');
    summaryFieldMetadataId = await createRichTextField('summary');
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
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('should keep the files a created body lists and return them with a signed url', async () => {
    const fileId = await uploadFile(bodyFieldMetadataId);

    const response = await createRecord([fileId]);

    expect(response.body.errors).toBeUndefined();

    const { body } = response.body.data.createRichTextFilesTestObject;

    expect(body.markdown).toBe('Notes');
    expect(body.files).toEqual([
      {
        fileId,
        label: 'notes.txt',
        extension: '.txt',
        url: expect.stringContaining(`/file/files-field/${fileId}`),
      },
    ]);
    expect(await findFileRow(fileId)).toMatchObject({
      deletedAt: null,
      settings: { isTemporaryFile: false },
    });
  });

  it('should keep a file an update adds and delete it once the list drops it', async () => {
    const fileId = await uploadFile(bodyFieldMetadataId);
    const created = await createRecord([]);
    const { id } = created.body.data.createRichTextFilesTestObject;

    const added = await updateRecord({
      id,
      body: { markdown: 'Notes', files: [{ fileId, label: 'notes.txt' }] },
    });

    expect(added.body.errors).toBeUndefined();
    expect(await findFileRow(fileId)).toMatchObject({
      deletedAt: null,
      settings: { isTemporaryFile: false },
    });

    const dropped = await updateRecord({
      id,
      body: { markdown: 'Notes', files: [] },
    });

    expect(dropped.body.errors).toBeUndefined();
    expect(dropped.body.data.updateRichTextFilesTestObject.body.files).toEqual(
      [],
    );
    expect((await findFileRow(fileId))?.deletedAt).not.toBeNull();
  });

  it('should leave the files untouched when an update does not list them', async () => {
    const fileId = await uploadFile(bodyFieldMetadataId);
    const created = await createRecord([fileId]);
    const { id } = created.body.data.createRichTextFilesTestObject;

    const updated = await updateRecord({ id, body: { markdown: 'Edited' } });

    expect(updated.body.errors).toBeUndefined();
    expect(updated.body.data.updateRichTextFilesTestObject.body).toMatchObject({
      markdown: 'Edited',
      files: [{ fileId, label: 'notes.txt' }],
    });
    expect((await findFileRow(fileId))?.deletedAt).toBeNull();
  });

  it('should refuse a file uploaded for another field', async () => {
    const fileId = await uploadFile(summaryFieldMetadataId);

    const response = await createRecord([fileId]);

    expect(response.body.errors[0].extensions.userFriendlyMessage).toBe(
      `File ${fileId} was not uploaded for this field. Please re-upload the file.`,
    );
    expect(await findFileRow(fileId)).toMatchObject({
      settings: { isTemporaryFile: true },
    });
  });

  it('should refuse a file another record already lists', async () => {
    const fileId = await uploadFile(bodyFieldMetadataId);

    await createRecord([fileId]);

    const response = await createRecord([fileId]);

    expect(response.body.errors[0].extensions.userFriendlyMessage).toBe(
      `File ${fileId} is already associated with a permanent files field. Please re-upload the file.`,
    );
  });

  it('should delete the files of a destroyed record', async () => {
    const fileId = await uploadFile(bodyFieldMetadataId);
    const created = await createRecord([fileId]);
    const { id } = created.body.data.createRichTextFilesTestObject;

    await makeGraphqlApiRequest({
      query: destroyRecordMutation,
      variables: { id },
    });
    await waitForAllJobsToFinish();

    expect(await findFileRow(fileId)).toBeUndefined();
  });

  it('should return the files through the REST API', async () => {
    const fileId = await uploadFile(bodyFieldMetadataId);
    const created = await createRecord([fileId]);
    const { id } = created.body.data.createRichTextFilesTestObject;

    const response = await makeRestApiRequest({
      method: 'get',
      path: `/richTextFilesTestObjects/${id}`,
    });

    expect(response.body.data.richTextFilesTestObject.body.files).toEqual([
      {
        fileId,
        label: 'notes.txt',
        extension: '.txt',
        url: expect.stringContaining(`/file/files-field/${fileId}`),
      },
    ]);
  });
});
