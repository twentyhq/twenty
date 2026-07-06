import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const UNKNOWN_APP_ID = uuidv4();

type TestContext = {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when filePath contains relative path traversal (../)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath:
        '../../../other-workspace/other-app/BuiltFrontComponent/stolen.mjs',
    },
  },
  {
    title: 'when filePath contains upward traversal (../../)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '../../etc/passwd',
    },
  },
  {
    title: 'when filePath is an absolute path',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '/etc/passwd',
    },
  },
  {
    title: 'when filePath contains backslash path traversal',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '..\\..\\..\\etc\\passwd',
    },
  },
  {
    title: 'when filePath is empty',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '',
    },
  },
  {
    title:
      'when applicationUniversalIdentifier does not match any installed application',
    context: {
      applicationUniversalIdentifier: UNKNOWN_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/legit.mjs',
    },
  },
  {
    title: 'when applicationUniversalIdentifier is empty',
    context: {
      applicationUniversalIdentifier: '',
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/legit.mjs',
    },
  },
  {
    title: 'when fileFolder is not an allowed application file folder',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'CorePicture',
      filePath: 'src/components/legit.mjs',
    },
  },
  {
    title: 'when filePath is a folder path without extension (bare UUID)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
    },
  },
  {
    title: 'when filePath is a nested folder path without extension',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Source',
      filePath: 'src/logic-functions/my-handler',
    },
  },
  {
    title:
      'when filePath has an invalid extension for BuiltFrontComponent (.js instead of .mjs)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/component.js',
    },
  },
  {
    title:
      'when filePath has an invalid extension for BuiltLogicFunction (.html)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'src/handlers/handler.html',
    },
  },
  {
    title:
      'when filePath has an invalid extension for Source (.js instead of .ts)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Source',
      filePath: 'src/index.js',
    },
  },
  {
    title:
      'when filePath has an invalid extension for Dependencies (.sh instead of .json/.lock)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Dependencies',
      filePath: 'install.sh',
    },
  },
];

describe('Upload application file should fail', () => {
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

      const { errors } = await uploadApplicationFile({
        applicationUniversalIdentifier: context.applicationUniversalIdentifier,
        fileFolder: context.fileFolder,
        filePath: context.filePath,
        fileBuffer: Buffer.from('content'),
        filename: 'test-file.mjs',
        contentType: 'application/javascript',
        expectToFail: true,
      });

      jest.useFakeTimers();

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});
