import crypto from 'crypto';

import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

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
  const registrationId = crypto.randomUUID();
  const applicationId = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, description, "oAuthClientId",
       "oAuthRedirectUris", "oAuthScopes", "workspaceId", "sourceType")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      registrationId,
      applicationUniversalIdentifier,
      name,
      description,
      oAuthClientId,
      [],
      [],
      TEST_WORKSPACE_ID,
      'local',
    ],
  );

  await globalThis.testDataSource.query(
    `INSERT INTO core."application"
      (id, "universalIdentifier", name, description, version, "sourcePath",
       "sourceType", "workspaceId", "applicationRegistrationId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      applicationId,
      applicationUniversalIdentifier,
      name,
      description,
      '1.0.0',
      sourcePath,
      'local',
      TEST_WORKSPACE_ID,
      registrationId,
    ],
  );

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
