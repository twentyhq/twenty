import crypto from 'crypto';

import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

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
      (id, "universalIdentifier", name, "oAuthClientId",
       "oAuthRedirectUris", "oAuthScopes", "workspaceId", "sourceType")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      registrationId,
      applicationUniversalIdentifier,
      name,
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
