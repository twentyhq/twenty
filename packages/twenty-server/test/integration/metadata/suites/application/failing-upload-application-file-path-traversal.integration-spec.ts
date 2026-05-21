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

type TestContext = {
  filePath: string;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when filePath contains relative path traversal (../)',
    context: {
      filePath:
        '../../../other-workspace/other-app/BuiltFrontComponent/stolen.mjs',
    },
  },
  {
    title: 'when filePath contains upward traversal (../../)',
    context: {
      filePath: '../../etc/passwd',
    },
  },
  {
    title: 'when filePath is an absolute path',
    context: {
      filePath: '/etc/passwd',
    },
  },
  {
    title: 'when filePath contains backslash path traversal',
    context: {
      filePath: '..\\..\\..\\etc\\passwd',
    },
  },
  {
    title: 'when filePath is empty',
    context: {
      filePath: '',
    },
  },
];

describe('Upload application file should fail for path traversal', () => {
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
        applicationUniversalIdentifier: TEST_APP_ID,
        fileFolder: 'BuiltFrontComponent',
        filePath: context.filePath,
        fileBuffer: Buffer.from('malicious content'),
        filename: 'exploit.mjs',
        contentType: 'application/javascript',
        expectToFail: true,
      });

      jest.useFakeTimers();

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );

  it('when applicationUniversalIdentifier does not match any installed application', async () => {
    jest.useRealTimers();

    const { errors } = await uploadApplicationFile({
      applicationUniversalIdentifier: uuidv4(),
      fileFolder: 'BuiltFrontComponent',
      filePath: 'src/components/legit.mjs',
      fileBuffer: Buffer.from('content'),
      filename: 'legit.mjs',
      contentType: 'application/javascript',
      expectToFail: true,
    });

    jest.useFakeTimers();

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
