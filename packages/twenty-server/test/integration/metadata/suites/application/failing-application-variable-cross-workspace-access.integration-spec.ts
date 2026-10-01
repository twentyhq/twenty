import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const VARIABLE_KEY = 'OTHER_WORKSPACE_VARIABLE';

// The harness only holds sessions of the Apple workspace, so the application
// and its variable are inserted directly into the other seeded workspace.
describe('Application variable update across workspaces should fail', () => {
  let otherWorkspaceApplicationId: string;
  let storedValue: string;

  beforeAll(async () => {
    const [{ id }] = await globalThis.testDataSource.query(
      `INSERT INTO core."application"
         ("universalIdentifier", "name", "sourcePath", "workspaceId")
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        uuidv4(),
        'Other workspace application',
        'other-workspace-application',
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );

    otherWorkspaceApplicationId = id;

    storedValue = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    ).encryptVersioned('initial' as PlaintextString, {
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
    });

    await globalThis.testDataSource.query(
      `INSERT INTO core."applicationVariable"
         ("universalIdentifier", "key", "value", "applicationId", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        uuidv4(),
        VARIABLE_KEY,
        storedValue,
        otherWorkspaceApplicationId,
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationVariable" WHERE "applicationId" = $1`,
      [otherWorkspaceApplicationId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."application" WHERE id = $1`,
      [otherWorkspaceApplicationId],
    );
  });

  it('should refuse to update a variable of an application installed in another workspace', async () => {
    const { errors } = await updateOneApplicationVariable({
      input: {
        key: VARIABLE_KEY,
        value: 'overwritten',
        applicationId: otherWorkspaceApplicationId,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    const [row] = await globalThis.testDataSource.query(
      `SELECT "value" FROM core."applicationVariable"
       WHERE "applicationId" = $1 AND "key" = $2`,
      [otherWorkspaceApplicationId, VARIABLE_KEY],
    );

    expect(row.value).toBe(storedValue);
  });
});
