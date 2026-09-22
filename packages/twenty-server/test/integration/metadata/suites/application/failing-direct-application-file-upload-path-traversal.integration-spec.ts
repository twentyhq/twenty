import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const UNKNOWN_APP_ID = uuidv4();

// The batch reservation reports a bad file as a per-file error and keeps the
// request alive; only a request-level problem (unknown or missing application)
// fails the whole mutation.
type FailureLevel = 'request' | 'file';

type TestContext = {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
  failureLevel: FailureLevel;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when filePath contains relative path traversal (../)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath:
        '../../../other-workspace/other-app/BuiltFrontComponent/stolen.mjs',
      failureLevel: 'file',
    },
  },
  {
    title: 'when filePath contains upward traversal (../../)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '../../etc/passwd',
      failureLevel: 'file',
    },
  },
  {
    title: 'when filePath is an absolute path',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '/etc/passwd',
      failureLevel: 'file',
    },
  },
  {
    title: 'when filePath contains backslash path traversal',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '..\\..\\..\\etc\\passwd',
      failureLevel: 'file',
    },
  },
  {
    title: 'when filePath is empty',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '',
      failureLevel: 'file',
    },
  },
  {
    title:
      'when applicationUniversalIdentifier does not match any installed application',
    context: {
      applicationUniversalIdentifier: UNKNOWN_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/legit.mjs',
      failureLevel: 'request',
    },
  },
  {
    title: 'when applicationUniversalIdentifier is empty',
    context: {
      applicationUniversalIdentifier: '',
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/legit.mjs',
      failureLevel: 'request',
    },
  },
  {
    title: 'when fileFolder is not an allowed application file folder',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'CorePicture',
      filePath: 'src/components/legit.mjs',
      failureLevel: 'file',
    },
  },
  {
    title: 'when filePath is a folder path without extension (bare UUID)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
      failureLevel: 'file',
    },
  },
  {
    title: 'when filePath is a nested folder path without extension',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Source',
      filePath: 'src/logic-functions/my-handler',
      failureLevel: 'file',
    },
  },
  {
    title:
      'when filePath has an invalid extension for BuiltFrontComponent (.js instead of .mjs)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/component.js',
      failureLevel: 'file',
    },
  },
  {
    title:
      'when filePath has an invalid extension for BuiltLogicFunction (.html)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'src/handlers/handler.html',
      failureLevel: 'file',
    },
  },
  {
    title:
      'when filePath has an invalid extension for Source (.js instead of .ts)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Source',
      filePath: 'src/index.js',
      failureLevel: 'file',
    },
  },
  {
    title:
      'when filePath has an invalid extension for Dependencies (.sh instead of .json/.lock)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Dependencies',
      filePath: 'install.sh',
      failureLevel: 'file',
    },
  },
];

describe('Application file upload reservation should fail', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Upload Path Traversal App',
      description: 'App for testing path traversal on file upload',
      sourcePath: 'test-upload-path-traversal',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      jest.useRealTimers();

      const { data, errors } = await createApplicationFileUploads({
        applicationUniversalIdentifier: context.applicationUniversalIdentifier,
        files: [
          {
            fileFolder: context.fileFolder,
            filePath: context.filePath,
            size: 'content'.length,
          },
        ],
        expectToFail: context.failureLevel === 'request',
      });

      jest.useFakeTimers();

      if (context.failureLevel === 'request') {
        expectOneNotInternalServerErrorSnapshot({ errors });

        return;
      }

      expect(errors).toBeUndefined();

      const { targets, errors: reservationErrors } =
        data.createApplicationFileUploads;

      expect(targets).toEqual([]);
      expect(reservationErrors).toEqual([
        {
          fileFolder: context.fileFolder,
          filePath: context.filePath,
          message: expect.any(String),
        },
      ]);
      expect(reservationErrors[0].message).toMatchSnapshot();
    },
    60000,
  );
});
