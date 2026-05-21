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

type TestContext = {
  fileFolder: string;
  fileFolderValue: FileFolder;
  filePath: string;
  filename: string;
  contentType: string;
  fileContent: string;
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when uploading a built front component',
    context: {
      fileFolder: 'BuiltFrontComponent',
      fileFolderValue: FileFolder.BuiltFrontComponent,
      filePath: 'src/components/my-component.mjs',
      filename: 'my-component.mjs',
      contentType: 'application/javascript',
      fileContent: 'export default function MyComponent() {}',
    },
  },
  {
    title: 'when uploading a built logic function',
    context: {
      fileFolder: 'BuiltLogicFunction',
      fileFolderValue: FileFolder.BuiltLogicFunction,
      filePath: 'src/handlers/my-handler.mjs',
      filename: 'my-handler.mjs',
      contentType: 'application/javascript',
      fileContent: 'export default async function handler() {}',
    },
  },
  {
    title: 'when uploading a source file',
    context: {
      fileFolder: 'Source',
      fileFolderValue: FileFolder.Source,
      filePath: 'src/index.tsx',
      filename: 'index.tsx',
      contentType: 'text/plain',
      fileContent: 'export const App = () => <div>Hello</div>;',
    },
  },
  {
    title: 'when uploading a public asset',
    context: {
      fileFolder: 'PublicAsset',
      fileFolderValue: FileFolder.PublicAsset,
      filePath: 'assets/logo.svg',
      filename: 'logo.svg',
      contentType: 'image/svg+xml',
      fileContent: '<svg></svg>',
    },
  },
  {
    title: 'when uploading a dependencies file',
    context: {
      fileFolder: 'Dependencies',
      fileFolderValue: FileFolder.Dependencies,
      filePath: 'yarn.lock',
      filename: 'yarn.lock',
      contentType: 'text/plain',
      fileContent: '# yarn lockfile v1',
    },
  },
  {
    title: 'when uploading a file in a nested directory path',
    context: {
      fileFolder: 'Source',
      fileFolderValue: FileFolder.Source,
      filePath: 'src/modules/auth/login/login.component.tsx',
      filename: 'login.component.tsx',
      contentType: 'text/plain',
      fileContent: 'export const Login = () => null;',
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
    async ({ context }) => {
      jest.useRealTimers();

      const { data, errors } = await uploadApplicationFile({
        applicationUniversalIdentifier: TEST_APP_ID,
        fileFolder: context.fileFolder,
        filePath: context.filePath,
        fileBuffer: Buffer.from(context.fileContent),
        filename: context.filename,
        contentType: context.contentType,
        expectToFail: false,
      });

      jest.useFakeTimers();

      expect(errors).toBeUndefined();
      expect(data.uploadApplicationFile).toEqual({
        id: expect.any(String),
        path: `${context.fileFolderValue}/${context.filePath}`,
      });
    },
    60000,
  );
});
