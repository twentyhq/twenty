import { createOneApplication } from 'test/integration/metadata/suites/application/utils/create-one-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';

export const setupApplicationForSync = async ({
  applicationUniversalIdentifier,
  name,
  description,
  sourcePath,
}: {
  applicationUniversalIdentifier: string;
  name: string;
  description: string;
  sourcePath: string;
}) => {
  await createOneApplication({
    universalIdentifier: applicationUniversalIdentifier,
    name,
    description,
    version: '1.0.0',
    sourcePath,
    expectToFail: false,
  });

  // File upload uses multipart which requires real timers
  jest.useRealTimers();

  const packageJson = JSON.stringify({
    name: sourcePath,
    version: '1.0.0',
  });

  await uploadApplicationFile({
    applicationUniversalIdentifier,
    fileFolder: 'Dependencies',
    filePath: 'package.json',
    fileBuffer: Buffer.from(packageJson),
    filename: 'package.json',
    expectToFail: false,
  });

  jest.useFakeTimers();
};
