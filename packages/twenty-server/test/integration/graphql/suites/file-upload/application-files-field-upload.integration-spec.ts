import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { type Manifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const createFileUploadMutation = gql`
  mutation CreateFileUpload(
    $filename: String!
    $size: Float!
    $fileFolder: FileFolder!
    $fieldMetadataUniversalIdentifier: String
  ) {
    createFileUpload(
      filename: $filename
      size: $size
      fileFolder: $fileFolder
      fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier
    ) {
      fileId
      uploadUrl
      contentType
    }
  }
`;

const completeFileUploadMutation = gql`
  mutation CompleteFileUpload($fileId: String!) {
    completeFileUpload(fileId: $fileId) {
      id
      path
      size
      url
    }
  }
`;

const uploadFilesFieldFileMutation = gql`
  mutation UploadFilesFieldFile(
    $file: Upload!
    $fieldMetadataUniversalIdentifier: String!
  ) {
    uploadFilesFieldFileByUniversalIdentifier(
      file: $file
      fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier
    ) {
      id
      path
    }
  }
`;

const deleteFileMutation = gql`
  mutation DeleteFile($fileId: UUID!) {
    deleteFile(fileId: $fileId) {
      id
    }
  }
`;

type TestApplication = {
  universalIdentifier: string;
  roleUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  filesFieldUniversalIdentifier: string;
  textFieldUniversalIdentifier: string;
  ownObjectPermissionUniversalIdentifier: string;
  callRecordingPermissionUniversalIdentifier: string;
};

const buildTestApplication = (): TestApplication => ({
  universalIdentifier: randomUUID(),
  roleUniversalIdentifier: randomUUID(),
  objectUniversalIdentifier: randomUUID(),
  filesFieldUniversalIdentifier: randomUUID(),
  textFieldUniversalIdentifier: randomUUID(),
  ownObjectPermissionUniversalIdentifier: randomUUID(),
  callRecordingPermissionUniversalIdentifier: randomUUID(),
});

const UPLOADING_APPLICATION = buildTestApplication();
const RESTRICTED_APPLICATION = buildTestApplication();
const FILE_CONTENT = Buffer.from('application files field upload');
const SETUP_TIMEOUT_MS = 120000;

type UploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
};

// The uploading application's role holds UPLOAD_FILE and may update its own
// object and the standard callRecording object, as the call-recorder app
// does. The restricted application's role holds nothing, while the member
// behind both tokens is an admin who holds every permission.
const buildManifest = ({
  application,
  nameSuffix,
  canUploadFiles,
}: {
  application: TestApplication;
  nameSuffix: string;
  canUploadFiles: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: application.universalIdentifier,
    roleId: application.roleUniversalIdentifier,
    overrides: {
      objects: [
        buildDefaultObjectManifest({
          applicationUniversalIdentifier: application.universalIdentifier,
          universalIdentifier: application.objectUniversalIdentifier,
          nameSingular: `uploadHolder${nameSuffix}`,
          namePlural: `uploadHolders${nameSuffix}`,
          labelSingular: `Upload Holder ${nameSuffix}`,
          labelPlural: `Upload Holders ${nameSuffix}`,
        }),
      ],
      fields: [
        {
          universalIdentifier: application.filesFieldUniversalIdentifier,
          objectUniversalIdentifier: application.objectUniversalIdentifier,
          type: FieldMetadataType.FILES,
          name: 'documents',
          label: 'Documents',
          isNullable: true,
          universalSettings: { maxNumberOfValues: 5 },
        },
        {
          universalIdentifier: application.textFieldUniversalIdentifier,
          objectUniversalIdentifier: application.objectUniversalIdentifier,
          type: FieldMetadataType.TEXT,
          name: 'note',
          label: 'Note',
          isNullable: true,
        },
      ],
      roles: [
        {
          universalIdentifier: application.roleUniversalIdentifier,
          label: `Upload Test Role ${nameSuffix}`,
          description: canUploadFiles
            ? 'May upload into files fields of objects it can update'
            : 'May not upload files',
          ...(canUploadFiles
            ? {
                permissionFlagUniversalIdentifiers: [
                  SystemPermissionFlag.UPLOAD_FILE,
                ],
                objectPermissions: [
                  {
                    universalIdentifier:
                      application.ownObjectPermissionUniversalIdentifier,
                    objectUniversalIdentifier:
                      application.objectUniversalIdentifier,
                    canReadObjectRecords: true,
                    canUpdateObjectRecords: true,
                  },
                  {
                    universalIdentifier:
                      application.callRecordingPermissionUniversalIdentifier,
                    objectUniversalIdentifier:
                      STANDARD_OBJECTS.callRecording.universalIdentifier,
                    canReadObjectRecords: true,
                    canUpdateObjectRecords: true,
                  },
                ],
              }
            : {}),
        },
      ],
    },
  });

describe('application files field upload', () => {
  let uploadingApplicationId: string;
  let uploadingApplicationToken: string;
  let uploadingApplicationOtherMemberToken: string;
  let restrictedApplicationToken: string;
  const uploadedFileIds: string[] = [];

  const setupApplication = async ({
    application,
    nameSuffix,
    canUploadFiles,
  }: {
    application: TestApplication;
    nameSuffix: string;
    canUploadFiles: boolean;
  }): Promise<string> => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: application.universalIdentifier,
      name: `Upload Test Application ${nameSuffix}`,
      description: `Application ${nameSuffix} for files field upload tests`,
      sourcePath: `test-files-field-upload-${application.universalIdentifier}`,
    });

    // setupApplicationForSync leaves fake timers installed.
    jest.useRealTimers();

    const { errors } = await syncApplication({
      manifest: buildManifest({ application, nameSuffix, canUploadFiles }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { data } = await findOneApplication({
      input: { universalIdentifier: application.universalIdentifier },
      expectToFail: false,
    });

    return data.findOneApplication.id;
  };

  const mintMemberBoundToken = async ({
    applicationId,
    userId,
    userWorkspaceId,
  }: {
    applicationId: string;
    userId: string;
    userWorkspaceId: string;
  }): Promise<string> => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId,
      userId,
      userWorkspaceId,
    });

    return applicationAccessToken.token;
  };

  const createFileUpload = ({
    fieldMetadataUniversalIdentifier,
    token,
  }: {
    fieldMetadataUniversalIdentifier: string;
    token?: string;
  }) =>
    makeMetadataAPIRequest(
      {
        query: createFileUploadMutation,
        variables: {
          filename: 'document.txt',
          size: FILE_CONTENT.length,
          fileFolder: 'FilesField',
          fieldMetadataUniversalIdentifier,
        },
      },
      token,
    );

  const completeFileUpload = ({
    fileId,
    token,
  }: {
    fileId: string;
    token?: string;
  }) =>
    makeMetadataAPIRequest(
      { query: completeFileUploadMutation, variables: { fileId } },
      token,
    );

  const uploadFilesFieldFile = ({
    fieldMetadataUniversalIdentifier,
    token,
  }: {
    fieldMetadataUniversalIdentifier: string;
    token?: string;
  }) =>
    makeMetadataAPIRequestWithFileUpload(
      {
        query: uploadFilesFieldFileMutation,
        variables: { file: null, fieldMetadataUniversalIdentifier },
      },
      {
        field: 'file',
        buffer: FILE_CONTENT,
        filename: 'document.txt',
        contentType: 'text/plain',
      },
      token,
    );

  const putFileToUploadUrl = ({ uploadUrl, contentType }: UploadTarget) => {
    // Integration tests run on the local storage driver, so the upload url
    // targets the server's streaming endpoint: replay it against the test app.
    const { pathname, search } = new URL(uploadUrl);

    return request(global.app.getHttpServer())
      .put(`${pathname}${search}`)
      .set('Content-Type', contentType)
      .send(FILE_CONTENT);
  };

  const initiateUploadAndSendBytes = async ({
    fieldMetadataUniversalIdentifier,
    token,
  }: {
    fieldMetadataUniversalIdentifier: string;
    token?: string;
  }): Promise<UploadTarget> => {
    const createResponse = await createFileUpload({
      fieldMetadataUniversalIdentifier,
      token,
    });

    expect(createResponse.body.errors).toBeUndefined();

    const uploadTarget: UploadTarget =
      createResponse.body.data.createFileUpload;

    uploadedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadUrl(uploadTarget);

    expect(putResponse.status).toBe(204);

    return uploadTarget;
  };

  const expectPermissionDenied = (response: request.Response) => {
    expect(response.body.data ?? null).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      subCode: 'PERMISSION_DENIED',
    });
  };

  beforeAll(async () => {
    jest.useRealTimers();

    uploadingApplicationId = await setupApplication({
      application: UPLOADING_APPLICATION,
      nameSuffix: 'A',
      canUploadFiles: true,
    });

    const restrictedApplicationId = await setupApplication({
      application: RESTRICTED_APPLICATION,
      nameSuffix: 'B',
      canUploadFiles: false,
    });

    uploadingApplicationToken = await mintMemberBoundToken({
      applicationId: uploadingApplicationId,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
    uploadingApplicationOtherMemberToken = await mintMemberBoundToken({
      applicationId: uploadingApplicationId,
      userId: USER_DATA_SEED_IDS.JONY,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });
    restrictedApplicationToken = await mintMemberBoundToken({
      applicationId: restrictedApplicationId,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
  }, SETUP_TIMEOUT_MS);

  afterAll(async () => {
    for (const fileId of uploadedFileIds) {
      try {
        await makeMetadataAPIRequest({
          query: deleteFileMutation,
          variables: { fileId },
        });
      } catch {
        // Cleanup is best-effort: pending uploads are reaped by the cron and
        // must not block the application teardown below.
      }
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: UPLOADING_APPLICATION.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        RESTRICTED_APPLICATION.universalIdentifier,
    });

    jest.useFakeTimers();
  }, SETUP_TIMEOUT_MS);

  it('should let an application upload into a files field on an object its role can update', async () => {
    const uploadTarget = await initiateUploadAndSendBytes({
      fieldMetadataUniversalIdentifier:
        UPLOADING_APPLICATION.filesFieldUniversalIdentifier,
      token: uploadingApplicationToken,
    });

    const completeResponse = await completeFileUpload({
      fileId: uploadTarget.fileId,
      token: uploadingApplicationToken,
    });

    expect(completeResponse.body.errors).toBeUndefined();
    expect(completeResponse.body.data.completeFileUpload).toMatchObject({
      id: uploadTarget.fileId,
      size: FILE_CONTENT.length,
    });
    expect(completeResponse.body.data.completeFileUpload.path).toContain(
      UPLOADING_APPLICATION.filesFieldUniversalIdentifier,
    );
  });

  it('should let an application upload into a standard files field its role can update', async () => {
    const createResponse = await createFileUpload({
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.callRecording.fields.video.universalIdentifier,
      token: uploadingApplicationToken,
    });

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data.createFileUpload.fileId).toBeDefined();

    uploadedFileIds.push(createResponse.body.data.createFileUpload.fileId);
  });

  it('should refuse an application upload into a files field on an object its role cannot update', async () => {
    const createResponse = await createFileUpload({
      fieldMetadataUniversalIdentifier:
        RESTRICTED_APPLICATION.filesFieldUniversalIdentifier,
      token: uploadingApplicationToken,
    });

    expectPermissionDenied(createResponse);
  });

  it('should refuse an application whose role lacks UPLOAD_FILE although the member holds it', async () => {
    const createResponse = await createFileUpload({
      fieldMetadataUniversalIdentifier:
        RESTRICTED_APPLICATION.filesFieldUniversalIdentifier,
      token: restrictedApplicationToken,
    });

    expectPermissionDenied(createResponse);
  });

  it('should only let the principal that initiated an upload complete it', async () => {
    const uploadTarget = await initiateUploadAndSendBytes({
      fieldMetadataUniversalIdentifier:
        UPLOADING_APPLICATION.filesFieldUniversalIdentifier,
      token: uploadingApplicationToken,
    });

    expectPermissionDenied(
      await completeFileUpload({ fileId: uploadTarget.fileId }),
    );
    expectPermissionDenied(
      await completeFileUpload({
        fileId: uploadTarget.fileId,
        token: uploadingApplicationOtherMemberToken,
      }),
    );

    const completeResponse = await completeFileUpload({
      fileId: uploadTarget.fileId,
      token: uploadingApplicationToken,
    });

    expect(completeResponse.body.errors).toBeUndefined();
    expect(completeResponse.body.data.completeFileUpload.id).toBe(
      uploadTarget.fileId,
    );

    expectPermissionDenied(
      await completeFileUpload({ fileId: uploadTarget.fileId }),
    );

    const resignResponse = await completeFileUpload({
      fileId: uploadTarget.fileId,
      token: uploadingApplicationToken,
    });

    expect(resignResponse.body.errors).toBeUndefined();
    expect(resignResponse.body.data.completeFileUpload.id).toBe(
      uploadTarget.fileId,
    );
  });

  it('should bind a multipart upload to the application that sent it', async () => {
    const uploadResponse = await uploadFilesFieldFile({
      fieldMetadataUniversalIdentifier:
        UPLOADING_APPLICATION.filesFieldUniversalIdentifier,
      token: uploadingApplicationToken,
    });

    expect(uploadResponse.body.errors).toBeUndefined();

    const { id: fileId } =
      uploadResponse.body.data.uploadFilesFieldFileByUniversalIdentifier;

    uploadedFileIds.push(fileId);

    expectPermissionDenied(await completeFileUpload({ fileId }));

    const resignResponse = await completeFileUpload({
      fileId,
      token: uploadingApplicationToken,
    });

    expect(resignResponse.body.errors).toBeUndefined();
    expect(resignResponse.body.data.completeFileUpload.id).toBe(fileId);
  });

  it('should refuse a multipart upload into a files field on an object the application cannot update', async () => {
    const uploadResponse = await uploadFilesFieldFile({
      fieldMetadataUniversalIdentifier:
        RESTRICTED_APPLICATION.filesFieldUniversalIdentifier,
      token: uploadingApplicationToken,
    });

    expectPermissionDenied(uploadResponse);
  });

  it('should refuse a target field that is not a files field', async () => {
    const createResponse = await createFileUpload({
      fieldMetadataUniversalIdentifier:
        UPLOADING_APPLICATION.textFieldUniversalIdentifier,
      token: uploadingApplicationToken,
    });

    expect(createResponse.body.data ?? null).toBeNull();
    expect(createResponse.body.errors[0].message).toContain(
      'not a files field',
    );
  });

  it('should refuse a field that does not exist in the workspace', async () => {
    const createResponse = await createFileUpload({
      fieldMetadataUniversalIdentifier: randomUUID(),
      token: uploadingApplicationToken,
    });

    expect(createResponse.body.data ?? null).toBeNull();
    expect(createResponse.body.errors[0].message).toContain('not found');
  });

  it('should keep letting a member upload into an application-owned files field', async () => {
    const uploadTarget = await initiateUploadAndSendBytes({
      fieldMetadataUniversalIdentifier:
        UPLOADING_APPLICATION.filesFieldUniversalIdentifier,
    });

    const completeResponse = await completeFileUpload({
      fileId: uploadTarget.fileId,
    });

    expect(completeResponse.body.errors).toBeUndefined();
    expect(completeResponse.body.data.completeFileUpload.id).toBe(
      uploadTarget.fileId,
    );
  });
});
