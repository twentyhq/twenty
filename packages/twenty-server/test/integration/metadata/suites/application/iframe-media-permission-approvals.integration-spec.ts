import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { FileFolder, type IframeMediaPermission } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const APPLICATION_NAME = 'Upgraded Iframe Media App';
const INSTALLED_VERSION = '1.1.0';
const EXISTING_PERMISSION = {
  origin: 'https://phone.example.com',
  microphone: true,
  camera: false,
};
const NEW_PERMISSION = {
  origin: 'https://video.example.com',
  microphone: false,
  camera: true,
};
const SECOND_NEW_PERMISSION = {
  origin: 'https://recording.example.com',
  microphone: true,
  camera: true,
};
const MANIFEST = buildBaseManifest({
  appId: APPLICATION_UNIVERSAL_IDENTIFIER,
  roleId: ROLE_UNIVERSAL_IDENTIFIER,
});

describe('Installed application iframe media permission approvals', () => {
  let applicationId: string;
  let applicationToken: string;
  let applicationService: ApplicationService;
  let fileStorageService: FileStorageService;

  const writeInstalledManifest = async (permissions: IframeMediaPermission[]) =>
    fileStorageService.writeFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.Source,
      resourcePath: 'manifest.json',
      sourceFile: Buffer.from(
        JSON.stringify({
          ...MANIFEST,
          application: {
            ...MANIFEST.application,
            requestedIframeMediaPermissions: permissions,
          },
        }),
      ),
      settings: { isTemporaryFile: false, toDelete: false },
    });

  const readApplication = () =>
    makeMetadataApiRequest({
      query: gql`
        query ReadInstalledApplicationIframeMediaPermissions($id: UUID!) {
          findOneApplication(id: $id) {
            id
            version
            requestedIframeMediaPermissions {
              origin
              microphone
              camera
            }
            grantedIframeMediaPermissions {
              origin
              microphone
              camera
            }
          }
        }
      `,
      variables: { id: applicationId },
    });

  const approvePermissions = ({
    permissions,
    token,
  }: {
    permissions: IframeMediaPermission[];
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: gql`
          mutation ApproveInstalledApplicationIframeMediaPermissions(
            $applicationId: UUID!
            $approvedIframeMediaPermissions: [IframeMediaPermissionInput!]!
          ) {
            approveApplicationIframeMediaPermissions(
              applicationId: $applicationId
              approvedIframeMediaPermissions: $approvedIframeMediaPermissions
            ) {
              id
              version
              grantedIframeMediaPermissions {
                origin
                microphone
                camera
              }
            }
          }
        `,
        variables: {
          applicationId,
          approvedIframeMediaPermissions: permissions,
        },
      },
      token,
    );

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: APPLICATION_NAME,
      description: 'Application for upgraded iframe media permission checks',
      sourcePath: `iframe-media-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
    });

    await syncApplication({
      manifest: {
        ...MANIFEST,
        application: {
          ...MANIFEST.application,
          requestedIframeMediaPermissions: [EXISTING_PERMISSION],
        },
        roles: [
          {
            ...MANIFEST.roles[0],
            permissionFlagUniversalIdentifiers: [
              SystemPermissionFlag.APPLICATIONS,
            ],
          },
        ],
      },
      expectToFail: false,
    });

    const { data } = await findOneApplication({
      input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      gqlFields: 'id',
      expectToFail: false,
    });

    applicationId = data.findOneApplication.id;
    applicationService = getAppProviderByClassName('ApplicationService');
    fileStorageService = getAppProviderByClassName('FileStorageService');

    jest.useRealTimers();

    await applicationService.update(applicationId, {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceType: ApplicationRegistrationSourceType.NPM,
      version: INSTALLED_VERSION,
    });

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId,
    });

    applicationToken = tokenPair.applicationAccessToken.token;
  }, 120000);

  beforeEach(async () => {
    await applicationService.update(applicationId, {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      grantedIframeMediaPermissions: [EXISTING_PERMISSION],
    });
    await writeInstalledManifest([EXISTING_PERMISSION, NEW_PERMISSION]);
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('approves the newly requested origin without reinstalling the installed version', async () => {
    const beforeApproval = await readApplication();

    expect(beforeApproval.body.errors).toBeUndefined();
    expect(beforeApproval.body.data.findOneApplication).toEqual({
      id: applicationId,
      version: INSTALLED_VERSION,
      requestedIframeMediaPermissions: [EXISTING_PERMISSION, NEW_PERMISSION],
      grantedIframeMediaPermissions: [EXISTING_PERMISSION],
    });

    const approval = await approvePermissions({
      permissions: [NEW_PERMISSION],
    });

    expect(approval.body.errors).toBeUndefined();
    expect(approval.body.data.approveApplicationIframeMediaPermissions).toEqual(
      {
        id: applicationId,
        version: INSTALLED_VERSION,
        grantedIframeMediaPermissions: [EXISTING_PERMISSION, NEW_PERMISSION],
      },
    );

    const afterApproval = await readApplication();

    expect(afterApproval.body.errors).toBeUndefined();
    expect(
      afterApproval.body.data.findOneApplication.grantedIframeMediaPermissions,
    ).toEqual([EXISTING_PERMISSION, NEW_PERMISSION]);

    const workspace = await makeMetadataApiRequest({
      query: gql`
        query ReadInstalledWorkspaceApplicationIframeMediaPermissions {
          currentUser {
            currentWorkspace {
              installedApplications {
                id
                grantedIframeMediaPermissions {
                  origin
                  microphone
                  camera
                }
              }
            }
          }
        }
      `,
    });

    expect(workspace.body.errors).toBeUndefined();
    expect(
      workspace.body.data.currentUser.currentWorkspace.installedApplications,
    ).toContainEqual({
      id: applicationId,
      grantedIframeMediaPermissions: [EXISTING_PERMISSION, NEW_PERMISSION],
    });
  });

  it('preserves both grants when different origins are approved concurrently', async () => {
    await writeInstalledManifest([
      EXISTING_PERMISSION,
      NEW_PERMISSION,
      SECOND_NEW_PERMISSION,
    ]);

    let releaseApplicationReads: () => void;
    const applicationReadsCompleted = new Promise<void>((resolve) => {
      releaseApplicationReads = resolve;
    });
    let applicationReadCount = 0;
    const findOneApplicationOrThrow =
      applicationService.findOneApplicationOrThrow.bind(applicationService);
    const applicationReadSpy = jest
      .spyOn(applicationService, 'findOneApplicationOrThrow')
      .mockImplementation(async (input) => {
        const application = await findOneApplicationOrThrow(input);

        applicationReadCount += 1;

        if (applicationReadCount === 2) {
          releaseApplicationReads();
        }

        await applicationReadsCompleted;

        return application;
      });

    try {
      const approvals = await Promise.all([
        approvePermissions({ permissions: [NEW_PERMISSION] }),
        approvePermissions({ permissions: [SECOND_NEW_PERMISSION] }),
      ]);

      for (const approval of approvals) {
        expect(approval.body.errors).toBeUndefined();
      }
    } finally {
      applicationReadSpy.mockRestore();
    }

    const application = await readApplication();

    expect(application.body.errors).toBeUndefined();
    expect(
      application.body.data.findOneApplication.grantedIframeMediaPermissions,
    ).toHaveLength(3);
    expect(
      application.body.data.findOneApplication.grantedIframeMediaPermissions,
    ).toEqual(
      expect.arrayContaining([
        EXISTING_PERMISSION,
        NEW_PERMISSION,
        SECOND_NEW_PERMISSION,
      ]),
    );
  });

  it('rejects an origin removed from the installed manifest after review', async () => {
    await writeInstalledManifest([EXISTING_PERMISSION]);

    const response = await approvePermissions({
      permissions: [NEW_PERMISSION],
    });

    expect(response.body.errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }),
      }),
    ]);

    const application = await readApplication();

    expect(
      application.body.data.findOneApplication.grantedIframeMediaPermissions,
    ).toEqual([EXISTING_PERMISSION]);
  });

  it('rejects a device permission that the installed manifest did not request', async () => {
    const response = await approvePermissions({
      permissions: [{ ...NEW_PERMISSION, microphone: true }],
    });

    expect(response.body.errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }),
      }),
    ]);

    const application = await readApplication();

    expect(
      application.body.data.findOneApplication.grantedIframeMediaPermissions,
    ).toEqual([EXISTING_PERMISSION]);
  });

  it.each([
    {
      title: 'a workspace member',
      token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN,
    },
    { title: 'an API key', token: () => API_KEY_ACCESS_TOKEN },
    {
      title: 'a user-bound application with application settings permission',
      token: () => applicationToken,
    },
  ])('refuses approval from $title', async ({ token }) => {
    const response = await approvePermissions({
      permissions: [NEW_PERMISSION],
      token: token(),
    });

    expect(response.body.errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({ code: 'FORBIDDEN' }),
      }),
    ]);

    const application = await readApplication();

    expect(
      application.body.data.findOneApplication.grantedIframeMediaPermissions,
    ).toEqual([EXISTING_PERMISSION]);
  });
});
