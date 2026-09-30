import crypto from 'crypto';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { completeAppTarballUpload } from 'test/integration/metadata/suites/application/utils/complete-app-tarball-upload.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { createAppTarballUpload } from 'test/integration/metadata/suites/application/utils/create-app-tarball-upload.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The upload flow runs cache-lock retries with real delays, so fake timers
// would hang it.
jest.setTimeout(120000);

type GlobalTestContext = {
  callingApplication: ApplicationWithResources;
  otherApplication: ApplicationWithResources;
  userBoundToken: string;
  unboundToken: string;
};

type TokenTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type TargetTestContext = {
  universalIdentifier: (globalContext: GlobalTestContext) => string;
};

const tokenTestCases: EachTestingContext<TokenTestContext>[] = [
  {
    title: 'with a user-bound application token',
    context: { token: (globalContext) => globalContext.userBoundToken },
  },
  {
    title: 'with an application token without user binding',
    context: { token: (globalContext) => globalContext.unboundToken },
  },
];

const targetTestCases: EachTestingContext<TargetTestContext>[] = [
  {
    title: 'for its own application',
    context: {
      universalIdentifier: (globalContext) =>
        globalContext.callingApplication.universalIdentifier,
    },
  },
  {
    title: 'for another application',
    context: {
      universalIdentifier: (globalContext) =>
        globalContext.otherApplication.universalIdentifier,
    },
  },
];

const buildTarball = (universalIdentifier: string): Promise<Buffer> =>
  createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: universalIdentifier,
        roleId: crypto.randomUUID(),
      }),
    ),
    'package.json': JSON.stringify({
      name: 'application-token-tarball-upload',
      version: '1.0.0',
    }),
  });

const findRegistration = async (
  universalIdentifier: string,
): Promise<{ sourceType: string; tarballFileId: string | null }> => {
  const [registration] = await globalThis.testDataSource.query(
    `SELECT "sourceType", "tarballFileId" FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

  return registration;
};

describe('Application token tarball upload should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    jest.useRealTimers();

    const callingApplication = await setupApplicationWithResources({
      name: 'Calling Application',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.APPLICATIONS,
        SystemPermissionFlag.MARKETPLACE_APPS,
        SystemPermissionFlag.UPLOAD_FILE,
      ],
    });
    const otherApplication = await setupApplicationWithResources({
      name: 'Other Application',
    });

    const [userBoundTokenPair, unboundTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: callingApplication.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: callingApplication.id,
      }),
    ]);

    globalTestContext = {
      callingApplication,
      otherApplication,
      userBoundToken: userBoundTokenPair.applicationAccessToken.token,
      unboundToken: unboundTokenPair.applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.callingApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        globalTestContext.otherApplication.universalIdentifier,
    });

    jest.useFakeTimers();
  });

  describe.each(eachTestingContextFilter(tokenTestCases))(
    '$title',
    ({ context: tokenContext }) => {
      it('should refuse to create a tarball upload', async () => {
        const { errors } = await createAppTarballUpload({
          size: 1024,
          token: tokenContext.token(globalTestContext),
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      describe.each(eachTestingContextFilter(targetTestCases))(
        '$title',
        ({ context: targetContext }) => {
          it('should refuse to upload a tarball', async () => {
            const universalIdentifier =
              targetContext.universalIdentifier(globalTestContext);

            const { errors } = await uploadAppTarball({
              tarballBuffer: await buildTarball(universalIdentifier),
              token: tokenContext.token(globalTestContext),
              expectToFail: true,
            });

            expectOneNotInternalServerErrorSnapshot({ errors });
            expect(await findRegistration(universalIdentifier)).toEqual({
              sourceType: 'local',
              tarballFileId: null,
            });
          });

          it('should refuse to complete a tarball upload', async () => {
            const universalIdentifier =
              targetContext.universalIdentifier(globalTestContext);
            const tarball = await buildTarball(universalIdentifier);

            const { data } = await createAppTarballUpload({
              size: tarball.length,
            });
            const uploadTarget = data!.createFileUpload;

            await putApplicationFileUploadTarget({
              uploadTarget,
              body: tarball,
            });

            const { errors } = await completeAppTarballUpload({
              fileId: uploadTarget.fileId,
              token: tokenContext.token(globalTestContext),
              expectToFail: true,
            });

            expectOneNotInternalServerErrorSnapshot({ errors });
            expect(await findRegistration(universalIdentifier)).toEqual({
              sourceType: 'local',
              tarballFileId: null,
            });
          });
        },
      );
    },
  );
});
