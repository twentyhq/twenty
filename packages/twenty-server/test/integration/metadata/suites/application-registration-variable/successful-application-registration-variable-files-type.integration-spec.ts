import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  FileFolder,
  ServerFileFolder,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

const VARIABLE_KEY = 'INVOICE_LOGO';
const SIGNED_VARIABLE_KEY = 'SIGNING_CERTIFICATE';

// A PNG signature is enough for the completion step to sniff the mime type
const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
]);

type ServerVariableFile = {
  fileId: string;
  label: string;
  extension: string;
  url: string;
};

type ServerVariable = {
  id: string;
  key: string;
  value: string | null;
  type: string;
  isSecret: boolean;
  isFilled: boolean;
  signUrl: boolean;
  files: ServerVariableFile[];
};

const readFileUrlTokenExpiry = (url: string): number | undefined => {
  const token = new URL(url).searchParams.get('token') ?? '';
  const [, payload] = token.split('.');

  return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp;
};

const fetchFile = (url: string) => {
  const { pathname, search } = new URL(url);

  return request(`http://localhost:${APP_PORT}`)
    .get(`${pathname}${search}`)
    .buffer(true)
    .parse((response, callback) => {
      const chunks: Buffer[] = [];

      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => callback(null, Buffer.concat(chunks)));
    });
};

describe('FILES server variable', () => {
  let dataSource: DataSource;
  let applicationRegistrationId: string;
  const applicationUniversalIdentifier = randomUUID();

  const createUpload = async (filename: string) => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CreateServerVariableFileUpload(
          $filename: String!
          $size: Float!
        ) {
          createFileUpload(
            filename: $filename
            size: $size
            fileFolder: ApplicationRegistrationVariableUpload
          ) {
            fileId
            uploadUrl
            contentType
            expiresAt
          }
        }
      `,
      variables: { filename, size: PNG_BYTES.length },
    });

    return response.body;
  };

  const completeUpload = async (fileId: string) => {
    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CompleteServerVariableFileUpload(
          $applicationRegistrationId: String!
          $fileId: UUID!
        ) {
          completeApplicationRegistrationVariableFileUpload(
            applicationRegistrationId: $applicationRegistrationId
            fileId: $fileId
          ) {
            id
            path
            url
          }
        }
      `,
      variables: { applicationRegistrationId, fileId },
    });

    return response.body;
  };

  const uploadLogo = async (
    filename: string,
  ): Promise<{
    uploadFileId: string;
    id: string;
    path: string;
    url: string;
  }> => {
    const { data, errors } = await createUpload(filename);

    expect(errors).toBeUndefined();

    const uploadTarget = data.createFileUpload;
    const putResponse = await putApplicationFileUploadTarget({
      uploadTarget,
      body: PNG_BYTES,
    });

    expect(putResponse.status).toBe(204);

    const completion = await completeUpload(uploadTarget.fileId);

    expect(completion.errors).toBeUndefined();

    return {
      uploadFileId: uploadTarget.fileId,
      ...completion.data.completeApplicationRegistrationVariableFileUpload,
    };
  };

  const readVariable = async (
    variableKey = VARIABLE_KEY,
  ): Promise<ServerVariable> => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query FindServerVariables($applicationRegistrationId: String!) {
          findApplicationRegistrationVariables(
            applicationRegistrationId: $applicationRegistrationId
          ) {
            id
            key
            value
            type
            isSecret
            isFilled
            signUrl
          }
        }
      `,
      variables: { applicationRegistrationId },
    });

    expect(response.body.errors).toBeUndefined();

    const variable =
      response.body.data.findApplicationRegistrationVariables.find(
        ({ key }: { key: string }) => key === variableKey,
      );

    if (!isDefined(variable)) {
      throw new Error(`Server variable ${variableKey} was not synced`);
    }

    return {
      ...variable,
      files: isDefined(variable.value) ? JSON.parse(variable.value) : [],
    };
  };

  const saveFiles = async ({
    files,
    variableKey = VARIABLE_KEY,
  }: {
    files: { fileId: string; label: string }[];
    variableKey?: string;
  }) => {
    const { id } = await readVariable(variableKey);

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation UpdateServerVariable(
          $input: UpdateApplicationRegistrationVariableInput!
        ) {
          updateApplicationRegistrationVariable(input: $input) {
            id
            isFilled
          }
        }
      `,
      variables: {
        input: {
          id,
          update: { value: files.length === 0 ? '' : JSON.stringify(files) },
        },
      },
    });

    return response.body;
  };

  const findFileRow = async (fileId: string) => {
    const [row] = await dataSource.query(
      `SELECT settings, status, path, "workspaceId", "applicationRegistrationId" FROM core."file" WHERE id = $1`,
      [fileId],
    );

    return row ?? null;
  };

  beforeAll(async () => {
    dataSource = global.testDataSource;

    const roleUniversalIdentifier = randomUUID();

    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Server Files Variable App',
      description: 'Declares FILES server variables',
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
            displayName: 'Server Files Variable App',
            description: 'Declares FILES server variables',
            serverVariables: {
              [VARIABLE_KEY]: {
                description: 'Printed on every invoice',
                type: FieldMetadataType.FILES,
              },
              [SIGNED_VARIABLE_KEY]: {
                description: 'Signs every invoice',
                type: FieldMetadataType.FILES,
                signUrl: true,
              },
            },
            packageJsonChecksum: null,
            yarnLockChecksum: null,
          },
          roles: [
            {
              universalIdentifier: roleUniversalIdentifier,
              label: 'Server Files Variable App role',
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
      gqlFields: 'id applicationRegistrationId',
      expectToFail: false,
    });

    const syncedRegistrationId: string | undefined =
      data.findOneApplication.applicationRegistrationId;

    if (!isDefined(syncedRegistrationId)) {
      throw new Error('The synced application has no registration');
    }

    applicationRegistrationId = syncedRegistrationId;

    // The upload PUT and storage completion need real timers
    jest.useRealTimers();
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
    jest.useFakeTimers();
  });

  it('should sync the variables with no file and never mark them secret', async () => {
    const variable = await readVariable();
    const signedVariable = await readVariable(SIGNED_VARIABLE_KEY);

    expect(variable).toMatchObject({
      type: FieldMetadataType.FILES,
      value: null,
      isFilled: false,
      isSecret: false,
      signUrl: false,
    });
    expect(signedVariable).toMatchObject({ signUrl: true, isSecret: false });
  });

  it('should move a completed upload to the registration storage', async () => {
    const { uploadFileId, id, path, url } = await uploadLogo('logo.png');

    expect(path).toBe(
      `${ServerFileFolder.ApplicationRegistrationVariable}/${applicationRegistrationId}/${id}.png`,
    );
    expect(url).toContain(
      `/file/${ServerFileFolder.ApplicationRegistrationVariable}/${id}?token=`,
    );
    expect(await findFileRow(uploadFileId)).toBeNull();
    expect(await findFileRow(id)).toMatchObject({
      workspaceId: null,
      applicationRegistrationId,
      settings: { isTemporaryFile: true, toDelete: false },
    });

    const fileResponse = await fetchFile(url);

    expect(fileResponse.status).toBe(200);
    expect(Buffer.from(fileResponse.body).equals(PNG_BYTES)).toBe(true);
  });

  it('should refuse serving the file without its token', async () => {
    const { url } = await uploadLogo('unsigned.png');

    const { pathname } = new URL(url);
    const fileResponse = await request(`http://localhost:${APP_PORT}`).get(
      pathname,
    );

    expect(fileResponse.status).not.toBe(200);
  });

  it('should bind an uploaded file and read it back with a permanent url', async () => {
    const { id: fileId } = await uploadLogo('logo.png');

    const { data, errors } = await saveFiles({
      files: [{ fileId, label: 'logo.png' }],
    });

    expect(errors).toBeUndefined();
    expect(data.updateApplicationRegistrationVariable.isFilled).toBe(true);

    const { files } = await readVariable();

    expect(files).toEqual([
      {
        fileId,
        label: 'logo.png',
        extension: '.png',
        url: expect.stringContaining(
          `/file/${ServerFileFolder.ApplicationRegistrationVariable}/${fileId}?token=`,
        ),
      },
    ]);
    expect(readFileUrlTokenExpiry(files[0].url)).toBeUndefined();
    expect(await findFileRow(fileId)).toMatchObject({
      settings: { isTemporaryFile: false, toDelete: false },
    });
  });

  it('should sign an expiring url for a variable that signs its urls', async () => {
    const { id: fileId } = await uploadLogo('certificate.png');

    await saveFiles({
      variableKey: SIGNED_VARIABLE_KEY,
      files: [{ fileId, label: 'certificate.png' }],
    });

    const { files } = await readVariable(SIGNED_VARIABLE_KEY);

    expect(files.map((file) => file.fileId)).toEqual([fileId]);
    expect(readFileUrlTokenExpiry(files[0].url)).toEqual(expect.any(Number));
  });

  it('should refuse a file that was not uploaded for the registration', async () => {
    const { files: filesBefore } = await readVariable();

    const { errors } = await saveFiles({
      files: [{ fileId: randomUUID(), label: 'elsewhere.png' }],
    });

    expect(errors).toBeDefined();

    const { files: filesAfter } = await readVariable();

    expect(filesAfter.map(({ fileId }) => fileId)).toEqual(
      filesBefore.map(({ fileId }) => fileId),
    );
  });

  it('should refuse binding the same file to two variables', async () => {
    const [boundFile] = (await readVariable()).files;

    const { errors } = await saveFiles({
      variableKey: SIGNED_VARIABLE_KEY,
      files: [{ fileId: boundFile.fileId, label: 'again.png' }],
    });

    expect(errors).toBeDefined();
  });

  it('should delete the file dropped when the list is replaced', async () => {
    const [previousFile] = (await readVariable()).files;
    const { id: newFileId } = await uploadLogo('new-logo.png');

    await saveFiles({ files: [{ fileId: newFileId, label: 'new-logo.png' }] });

    const { files } = await readVariable();

    expect(files.map(({ fileId }) => fileId)).toEqual([newFileId]);
    expect(await findFileRow(previousFile.fileId)).toBeNull();
  });

  it('should clear the variable and delete its file', async () => {
    const [fileToDrop] = (await readVariable()).files;

    await saveFiles({ files: [] });

    const variable = await readVariable();

    expect(variable).toMatchObject({ value: null, isFilled: false });
    expect(await findFileRow(fileToDrop.fileId)).toBeNull();
  });

  it('should refuse completing an upload for another registration', async () => {
    const { data } = await createUpload('other.png');
    const uploadTarget = data.createFileUpload;

    await putApplicationFileUploadTarget({ uploadTarget, body: PNG_BYTES });

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation CompleteForeignUpload(
          $applicationRegistrationId: String!
          $fileId: UUID!
        ) {
          completeApplicationRegistrationVariableFileUpload(
            applicationRegistrationId: $applicationRegistrationId
            fileId: $fileId
          ) {
            id
          }
        }
      `,
      variables: {
        applicationRegistrationId: randomUUID(),
        fileId: uploadTarget.fileId,
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(await findFileRow(uploadTarget.fileId)).toMatchObject({
      path: `${FileFolder.ApplicationRegistrationVariableUpload}/${uploadTarget.fileId}.png`,
    });
  });
});
