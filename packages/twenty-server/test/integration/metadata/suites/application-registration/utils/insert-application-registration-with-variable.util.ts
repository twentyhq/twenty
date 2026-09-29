import crypto from 'crypto';

import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const TARGET_VARIABLE_KEY = 'TARGET_API_KEY';

// A registration owned by the Apple workspace with a client secret and one
// server variable, so every registration mutation has something to change.
export const insertApplicationRegistrationWithVariable = async ({
  name,
}: {
  name: string;
}): Promise<{ applicationRegistrationId: string; variableId: string }> => {
  const applicationRegistrationId = crypto.randomUUID();

  await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId",
       "oAuthClientSecretHash", "oAuthRedirectUris", "oAuthScopes",
       "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      applicationRegistrationId,
      crypto.randomUUID(),
      name,
      crypto.randomUUID(),
      'target-client-secret-hash',
      ['https://target.example.com/callback'],
      ['api'],
      SEED_APPLE_WORKSPACE_ID,
    ],
  );

  const variableId = await insertApplicationRegistrationVariable({
    applicationRegistrationId,
    key: TARGET_VARIABLE_KEY,
    value: 'target-secret-value',
  });

  return { applicationRegistrationId, variableId };
};
