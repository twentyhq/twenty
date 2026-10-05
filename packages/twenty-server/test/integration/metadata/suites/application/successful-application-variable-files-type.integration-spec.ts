import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { type DataSource } from 'typeorm';

const VARIABLE_KEY = 'INVOICE_LOGO';

// A PNG signature is enough for the completion step to sniff the mime type
const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
]);

type ApplicationVariableFile = {
  fileId: string;
  label: string;
  extension: string;
  url: string;
};

describe('FILES application variable', () => {
  let dataSource: DataSource;
  let applicationId: string;
  const applicationUniversalIdentifier = randomUUID();

  const createApplicationVariableFileUpload = async ({
    filename,
    size,
  }: {
    filename: string;
    size: number;
  }) => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CreateApplicationVariableFileUpload(
          $filename: String!
          $size: Float!
          $applicationId: UUID!
        ) {
          createFileUpload(
            filename: $filename
            size: $size
            fileFolder: ApplicationVariable
            applicationId: $applicationId
          ) {
            fileId
            uploadUrl
            contentType
            expiresAt
          }
        }
      `,
      variables: { filename, size, applicationId },
    });

    return response.body;
  };

  const completeFileUpload = async (fileId: string) => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CompleteFileUpload($fileId: String!) {
          completeFileUpload(fileId: $fileId) {
            id
          }
        }
      `,
      variables: { fileId },
    });

    return response.body;
  };

  const uploadLogo = async (filename: string): Promise<string> => {
    const { data, errors } = await createApplicationVariableFileUpload({
      filename,
      size: PNG_BYTES.length,
    });

    expect(errors).toBeUndefined();

    const uploadTarget = data.createFileUpload;
    const putResponse = await putApplicationFileUploadTarget({
      uploadTarget,
      body: PNG_BYTES,
    });

    expect(putResponse.status).toBe(204);

    const completion = await completeFileUpload(uploadTarget.fileId);

    expect(completion.errors).toBeUndefined();

    return uploadTarget.fileId;
  };

  const readVariable = async (): Promise<{
    value: string;
    type: string;
    files: ApplicationVariableFile[];
  }> => {
    const { data } = await findOneApplication({
      input: { id: applicationId },
      gqlFields: `
        applicationVariables {
          key
          value
          type
        }
      `,
      expectToFail: false,
    });

    const variable = data.findOneApplication.applicationVariables.find(
      ({ key }: { key: string }) => key === VARIABLE_KEY,
    );

    return {
      value: variable.value,
      type: variable.type,
      files: variable.value === '' ? [] : JSON.parse(variable.value),
    };
  };

  const findFileRow = async (fileId: string) => {
    const [row] = await dataSource.query(
      `SELECT settings, status, path, "applicationId" FROM core."file" WHERE id = $1`,
      [fileId],
    );

    return row ?? null;
  };

  const saveFiles = ({
    files,
    expectToFail = false,
  }: {
    files: { fileId: string; label: string }[];
    expectToFail?: boolean;
  }) =>
    updateOneApplicationVariable({
      input: {
        key: VARIABLE_KEY,
        value: files.length === 0 ? '' : JSON.stringify(files),
        applicationId,
      },
      expectToFail,
    });

  beforeAll(async () => {
    dataSource = global.testDataSource;

    const roleUniversalIdentifier = randomUUID();

    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Files Variable App',
      description: 'Declares a FILES application variable',
      sourcePath: `test-${applicationUniversalIdentifier}`,
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: roleUniversalIdentifier,
        overrides: {
          application: {
            universalIdentifier: applicationUniversalIdentifier,
            defaultRoleUniversalIdentifier: roleUniversalIdentifier,
            displayName: 'Files Variable App',
            description: 'Declares a FILES application variable',
            applicationVariables: {
              [VARIABLE_KEY]: {
                universalIdentifier: randomUUID(),
                label: 'Invoice logo',
                type: FieldMetadataType.FILES,
                isRequired: true,
              },
            },
            packageJsonChecksum: null,
            yarnLockChecksum: null,
          },
          roles: [
            {
              universalIdentifier: roleUniversalIdentifier,
              label: 'Files Variable App role',
              description: 'Manages applications',
              canUpdateAllSettings: false,
              permissionFlagUniversalIdentifiers: [
                SystemPermissionFlag.APPLICATIONS,
              ],
              objectPermissions: [],
            },
          ],
        },
      }),
      expectToFail: false,
    });

    const { data } = await findOneApplication({
      input: { universalIdentifier: applicationUniversalIdentifier },
      gqlFields: 'id',
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;

    // The upload PUT and storage completion need real timers
    jest.useRealTimers();
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
    jest.useFakeTimers();
  });

  it('should sync the variable with no file', async () => {
    const variable = await readVariable();

    expect(variable.type).toBe(FieldMetadataType.FILES);
    expect(variable.value).toBe('');
  });

  it('should bind an uploaded file and read it back with a signed url', async () => {
    const fileId = await uploadLogo('logo.png');

    const { data } = await saveFiles({
      files: [{ fileId, label: 'logo.png' }],
    });

    expect(data.updateOneApplicationVariable).toBe(true);

    const { files } = await readVariable();

    expect(files).toEqual([
      {
        fileId,
        label: 'logo.png',
        extension: '.png',
        url: expect.stringContaining(
          `/file/${FileFolder.ApplicationVariable}/${fileId}?token=`,
        ),
      },
    ]);

    const fileRow = await findFileRow(fileId);

    expect(fileRow).toMatchObject({
      status: 'UPLOADED',
      applicationId,
      path: `${FileFolder.ApplicationVariable}/${fileId}.png`,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  });

  it('should refuse a file that was not uploaded for the variable', async () => {
    const { files: filesBefore } = await readVariable();

    const { errors } = await saveFiles({
      files: [{ fileId: randomUUID(), label: 'elsewhere.png' }],
      expectToFail: true,
    });

    expect(errors).toBeDefined();

    const { files: filesAfter } = await readVariable();

    expect(filesAfter.map(({ fileId }) => fileId)).toEqual(
      filesBefore.map(({ fileId }) => fileId),
    );
  });

  it('should refuse binding the same upload twice', async () => {
    const { files } = await readVariable();
    const [boundFile] = files;
    const otherFileId = await uploadLogo('other.png');

    await saveFiles({
      files: [{ fileId: otherFileId, label: 'other.png' }],
    });

    const { errors } = await saveFiles({
      files: [{ fileId: boundFile.fileId, label: 'again.png' }],
      expectToFail: true,
    });

    expect(errors).toBeDefined();
  });

  it('should delete the file dropped when the list is replaced', async () => {
    const { files } = await readVariable();
    const [previousFile] = files;
    const newFileId = await uploadLogo('new-logo.png');

    await saveFiles({ files: [{ fileId: newFileId, label: 'new-logo.png' }] });

    const { files: filesAfter } = await readVariable();

    expect(filesAfter.map(({ fileId }) => fileId)).toEqual([newFileId]);
    expect(await findFileRow(previousFile.fileId)).toBeNull();
    expect(await findFileRow(newFileId)).toMatchObject({
      settings: { isTemporaryFile: false, toDelete: false },
    });
  });

  it('should clear the variable and delete its file', async () => {
    const { files } = await readVariable();
    const [fileToDrop] = files;

    await saveFiles({ files: [] });

    const { value } = await readVariable();

    expect(value).toBe('');
    expect(await findFileRow(fileToDrop.fileId)).toBeNull();
  });
});
