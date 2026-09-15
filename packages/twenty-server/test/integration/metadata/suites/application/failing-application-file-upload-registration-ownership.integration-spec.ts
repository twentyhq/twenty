import { readFileSync } from 'fs';
import { join } from 'path';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { completeApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads.util';
import { createApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const TEST_APP_UID = uuidv4();
const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');

const HANDLER_PATH = 'handler.mjs';
const OWNER_HANDLER = 'export const main = () => "owner";';
const REPLACEMENT_HANDLER = 'export const main = () => process.env;';

type RegistrationOwnership = 'foreign' | 'unclaimed' | 'none';

type TestContext = {
  registrationOwnership: RegistrationOwnership;
  unlinkApplicationRegistration?: boolean;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when another workspace owns the application registration',
    context: { registrationOwnership: 'foreign' },
  },
  {
    title: 'when no workspace has claimed the application registration',
    context: { registrationOwnership: 'unclaimed' },
  },
  {
    title: 'when the application has no registration',
    context: { registrationOwnership: 'none' },
  },
  {
    title:
      'when the application has no registration link and another workspace owns the registration',
    context: {
      registrationOwnership: 'foreign',
      unlinkApplicationRegistration: true,
    },
  },
];

const normalizeMessage = (message: string) =>
  message.replace(
    new RegExp(TEST_APP_UID, 'g'),
    '<applicationUniversalIdentifier>',
  );

const getTargetApplicationUniversalIdentifier = (
  registrationOwnership: RegistrationOwnership,
) =>
  registrationOwnership === 'none'
    ? TWENTY_STANDARD_APPLICATION.universalIdentifier
    : TEST_APP_UID;

const setTestRegistrationOwnerWorkspaceId = async (
  ownerWorkspaceId: string | null,
) => {
  await globalThis.testDataSource.query(
    `UPDATE core."applicationRegistration" SET "workspaceId" = $1
     WHERE "universalIdentifier" = $2`,
    [ownerWorkspaceId, TEST_APP_UID],
  );
};

const unlinkTestApplicationRegistration = async () => {
  await globalThis.testDataSource.query(
    `UPDATE core."application" SET "applicationRegistrationId" = NULL
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_APP_UID, SEED_APPLE_WORKSPACE_ID],
  );
};

const relinkTestApplicationRegistration = async () => {
  await globalThis.testDataSource.query(
    `UPDATE core."application" SET "applicationRegistrationId" = (
       SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1
     )
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [TEST_APP_UID, SEED_APPLE_WORKSPACE_ID],
  );
};

const applyRegistrationLink = async ({
  unlinkApplicationRegistration,
}: TestContext) => {
  if (unlinkApplicationRegistration === true) {
    await unlinkTestApplicationRegistration();
  }
};

const applyRegistrationOwnership = async (
  registrationOwnership: RegistrationOwnership,
) => {
  if (registrationOwnership === 'foreign') {
    await setTestRegistrationOwnerWorkspaceId(SEED_YCOMBINATOR_WORKSPACE_ID);
  }

  if (registrationOwnership === 'unclaimed') {
    await setTestRegistrationOwnerWorkspaceId(null);
  }
};

const readStoredHandler = (applicationUniversalIdentifier: string) => {
  try {
    return readFileSync(
      join(
        STORAGE_LOCAL_PATH,
        SEED_APPLE_WORKSPACE_ID,
        applicationUniversalIdentifier,
        'built-logic-function',
        HANDLER_PATH,
      ),
      'utf-8',
    );
  } catch {
    return null;
  }
};

const countApplicationFiles = async (
  applicationUniversalIdentifier: string,
) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT count(*)::int AS count FROM core."file" WHERE "applicationId" IN (
      SELECT id FROM core."application"
      WHERE "universalIdentifier" = $1 AND "workspaceId" = $2
    )`,
    [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return count as number;
};

const getFileStatus = async (fileId: string) => {
  const [file] = await globalThis.testDataSource.query(
    `SELECT status FROM core."file" WHERE id = $1`,
    [fileId],
  );

  return file?.status as string | undefined;
};

const reservePendingHandlerUpload = async () => {
  const body = Buffer.from(REPLACEMENT_HANDLER);

  const { data } = await createApplicationFileUploads({
    applicationUniversalIdentifier: TEST_APP_UID,
    files: [
      {
        fileFolder: 'BuiltLogicFunction',
        filePath: HANDLER_PATH,
        size: body.length,
      },
    ],
  });

  const [uploadTarget] = data.createApplicationFileUploads.targets;

  const response = await putApplicationFileUploadTarget({
    uploadTarget,
    body,
  });

  expect(response.status).toBe(204);

  return uploadTarget.fileId;
};

describe('Application file endpoints should fail', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UID,
      name: 'Test Application File Upload Ownership App',
      description: 'App for verifying registration ownership on file uploads',
      sourcePath: 'test-application-file-upload-ownership',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_UID,
      fileFolder: 'BuiltLogicFunction',
      filePath: HANDLER_PATH,
      fileBuffer: Buffer.from(OWNER_HANDLER),
      filename: HANDLER_PATH,
      contentType: 'application/javascript',
    });

    jest.useFakeTimers();
  }, 60000);

  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(async () => {
    await setTestRegistrationOwnerWorkspaceId(SEED_APPLE_WORKSPACE_ID);
    await relinkTestApplicationRegistration();
    jest.useFakeTimers();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UID,
    });
  });

  describe('uploadApplicationFile', () => {
    it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
      '$title',
      async ({ context }) => {
        const applicationUniversalIdentifier =
          getTargetApplicationUniversalIdentifier(
            context.registrationOwnership,
          );
        const storedHandlerBefore = readStoredHandler(
          applicationUniversalIdentifier,
        );
        const filesBefore = await countApplicationFiles(
          applicationUniversalIdentifier,
        );

        await applyRegistrationLink(context);
        await applyRegistrationOwnership(context.registrationOwnership);

        const { errors } = await uploadApplicationFile({
          applicationUniversalIdentifier,
          fileFolder: 'BuiltLogicFunction',
          filePath: HANDLER_PATH,
          fileBuffer: Buffer.from(REPLACEMENT_HANDLER),
          filename: HANDLER_PATH,
          contentType: 'application/javascript',
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
        expect(readStoredHandler(applicationUniversalIdentifier)).toBe(
          storedHandlerBefore,
        );
        expect(
          await countApplicationFiles(applicationUniversalIdentifier),
        ).toBe(filesBefore);
      },
      30000,
    );
  });

  describe('createApplicationFileUploads', () => {
    it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
      '$title',
      async ({ context }) => {
        const applicationUniversalIdentifier =
          getTargetApplicationUniversalIdentifier(
            context.registrationOwnership,
          );
        const filesBefore = await countApplicationFiles(
          applicationUniversalIdentifier,
        );

        await applyRegistrationLink(context);
        await applyRegistrationOwnership(context.registrationOwnership);

        const { errors } = await createApplicationFileUploads({
          applicationUniversalIdentifier,
          files: [
            {
              fileFolder: 'BuiltLogicFunction',
              filePath: HANDLER_PATH,
              size: 10,
            },
            { fileFolder: 'Dependencies', filePath: 'package.json', size: 10 },
          ],
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
        expect(
          await countApplicationFiles(applicationUniversalIdentifier),
        ).toBe(filesBefore);
      },
      30000,
    );
  });

  describe('completeApplicationFileUploads', () => {
    it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
      '$title',
      async ({ context }) => {
        await applyRegistrationLink(context);

        // Reserving while the row is unlinked also proves the owner is still
        // allowed to upload when the registration only matches by identifier.
        const pendingFileId = await reservePendingHandlerUpload();

        await applyRegistrationOwnership(context.registrationOwnership);

        const { errors } = await completeApplicationFileUploads({
          applicationUniversalIdentifier:
            getTargetApplicationUniversalIdentifier(
              context.registrationOwnership,
            ),
          fileIds: [pendingFileId],
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
        expect(await getFileStatus(pendingFileId)).toBe('PENDING');
      },
      30000,
    );
  });
});
