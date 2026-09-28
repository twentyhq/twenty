import { randomUUID } from 'crypto';

import { createApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export type SeededRegistration = {
  applicationRegistrationId: string;
  secretVariableId: string;
  nonSecretVariableId: string;
};

export const SECRET_PLAINTEXT_VALUE = 'admin-panel-scope-secret-value';
export const NON_SECRET_PLAINTEXT_VALUE =
  'https://admin-panel-scope.example.com';
export const OBFUSCATED_VALUE = '•••••••••••••';

export const deleteSeededRegistration = async (
  applicationRegistrationId: string,
): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."applicationRegistration" WHERE id = $1`,
    [applicationRegistrationId],
  );
};

// Seeded as Apple-owned so the variables can be created through the
// workspace-scoped API with properly encrypted values, then handed to
// YCombinator: the admin panel is expected to reach any workspace.
export const seedRegistrationOwnedByAnotherWorkspace = async (
  name: string,
): Promise<SeededRegistration> => {
  const applicationRegistrationId = randomUUID();

  await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId",
       "oAuthRedirectUris", "oAuthScopes", "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      applicationRegistrationId,
      randomUUID(),
      name,
      randomUUID(),
      [],
      [],
      SEED_APPLE_WORKSPACE_ID,
    ],
  );

  // The row exists from here on, so anything that throws below has to take it
  // back out: this database is shared by every suite in the run.
  try {
    const { data: secretData } = await createApplicationRegistrationVariable({
      applicationRegistrationId,
      key: 'ADMIN_SCOPE_API_KEY',
      value: SECRET_PLAINTEXT_VALUE,
      isSecret: true,
      expectToFail: false,
    });

    const { data: nonSecretData } = await createApplicationRegistrationVariable(
      {
        applicationRegistrationId,
        key: 'ADMIN_SCOPE_PUBLIC_URL',
        value: NON_SECRET_PLAINTEXT_VALUE,
        isSecret: false,
        expectToFail: false,
      },
    );

    await globalThis.testDataSource.query(
      `UPDATE core."applicationRegistration" SET "workspaceId" = $2 WHERE id = $1`,
      [applicationRegistrationId, SEED_YCOMBINATOR_WORKSPACE_ID],
    );

    return {
      applicationRegistrationId,
      secretVariableId: secretData.createApplicationRegistrationVariable.id,
      nonSecretVariableId:
        nonSecretData.createApplicationRegistrationVariable.id,
    };
  } catch (error) {
    await deleteSeededRegistration(applicationRegistrationId);

    throw error;
  }
};

export const readEncryptedValue = async (
  variableId: string,
): Promise<string | null> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "encryptedValue" FROM core."applicationRegistrationVariable" WHERE id = $1`,
    [variableId],
  );

  return row?.encryptedValue ?? null;
};
