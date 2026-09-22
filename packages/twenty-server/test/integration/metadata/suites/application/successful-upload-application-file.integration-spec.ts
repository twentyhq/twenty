import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FileFolder } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();

type UploadInput = {
  fileFolder: string;
  filePath: string;
  filename: string;
  contentType: string;
  fileContent: string;
};

type UploadExpected = {
  fileFolderValue: FileFolder;
  persistedMimeType: string;
};

type TestContext = {
  input: UploadInput;
  expected: UploadExpected;
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when uploading a built front component',
    context: {
      input: {
        fileFolder: 'BuiltFrontComponent',
        filePath: 'src/components/my-component.mjs',
        filename: 'my-component.mjs',
        contentType: 'application/javascript',
        fileContent: 'export default function MyComponent() {}',
      },
      expected: {
        fileFolderValue: FileFolder.BuiltFrontComponent,
        persistedMimeType: 'text/javascript',
      },
    },
  },
  {
    title: 'when uploading a built logic function',
    context: {
      input: {
        fileFolder: 'BuiltLogicFunction',
        filePath: 'src/handlers/my-handler.mjs',
        filename: 'my-handler.mjs',
        contentType: 'application/javascript',
        fileContent: 'export default async function handler() {}',
      },
      expected: {
        fileFolderValue: FileFolder.BuiltLogicFunction,
        persistedMimeType: 'text/javascript',
      },
    },
  },
  {
    title: 'when uploading a source file',
    context: {
      input: {
        fileFolder: 'Source',
        filePath: 'src/index.tsx',
        filename: 'index.tsx',
        contentType: 'text/plain',
        fileContent: 'export const App = () => <div>Hello</div>;',
      },
      expected: {
        fileFolderValue: FileFolder.Source,
        persistedMimeType: 'application/typescript',
      },
    },
  },
  {
    title: 'when uploading a public asset',
    context: {
      input: {
        fileFolder: 'PublicAsset',
        filePath: 'assets/logo.svg',
        filename: 'logo.svg',
        contentType: 'image/svg+xml',
        fileContent: '<svg></svg>',
      },
      expected: {
        fileFolderValue: FileFolder.PublicAsset,
        persistedMimeType: 'image/svg+xml',
      },
    },
  },
  {
    title: 'when uploading a dependencies file',
    context: {
      input: {
        fileFolder: 'Dependencies',
        filePath: 'yarn.lock',
        filename: 'yarn.lock',
        contentType: 'text/plain',
        fileContent: '# yarn lockfile v1',
      },
      expected: {
        fileFolderValue: FileFolder.Dependencies,
        persistedMimeType: 'application/octet-stream',
      },
    },
  },
  {
    title: 'when uploading a file in a nested directory path',
    context: {
      input: {
        fileFolder: 'Source',
        filePath: 'src/modules/auth/login/login.component.tsx',
        filename: 'login.component.tsx',
        contentType: 'text/plain',
        fileContent: 'export const Login = () => null;',
      },
      expected: {
        fileFolderValue: FileFolder.Source,
        persistedMimeType: 'application/typescript',
      },
    },
  },
];

describe('Upload application file should succeed', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Successful Upload App',
      description: 'App for testing successful file uploads',
      sourcePath: 'test-successful-upload',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    '$title',
    async ({ context: { input, expected } }) => {
      jest.useRealTimers();

      const { data, errors } = await uploadApplicationFile({
        applicationUniversalIdentifier: TEST_APP_ID,
        fileFolder: input.fileFolder,
        filePath: input.filePath,
        fileBuffer: Buffer.from(input.fileContent),
        filename: input.filename,
        contentType: input.contentType,
        expectToFail: false,
      });

      jest.useFakeTimers();

      expect(errors).toBeUndefined();
      expect(data.uploadApplicationFile).toEqual({
        id: expect.any(String),
        path: `${expected.fileFolderValue}/${input.filePath}`,
      });

      const [row] = await globalThis.testDataSource.query(
        `SELECT "mimeType" FROM core."file" WHERE id = $1`,
        [data.uploadApplicationFile.id],
      );

      expect(row.mimeType).toBe(expected.persistedMimeType);
    },
    60000,
  );
});
