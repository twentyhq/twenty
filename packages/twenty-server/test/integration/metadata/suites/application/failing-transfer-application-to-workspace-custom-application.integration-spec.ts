import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { runTransferApplicationToWorkspaceCustomApplicationCommand } from 'test/integration/metadata/suites/application/utils/run-transfer-application-to-workspace-custom-application-command.util';
import {
  buildTransferredApplicationManifest,
  buildTransferredObjectNameSingular,
  findApplicationId,
  findRowsOwnedByApplication,
  findWorkspaceCustomApplication,
  installTransferredApplication,
  TRANSFERRED_BUILT_HANDLER_PATH,
} from 'test/integration/metadata/suites/application/utils/transferred-application.util';
import { FileFolder } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Transfer an application to the workspace custom application should fail', () => {
  const applicationUniversalIdentifier = uuidv4();
  const collidingFileId = uuidv4();

  let workspaceCustomApplicationId: string;
  let sourceApplicationId: string;

  beforeAll(async () => {
    workspaceCustomApplicationId = (await findWorkspaceCustomApplication()).id;
    sourceApplicationId = await installTransferredApplication({
      applicationUniversalIdentifier,
      manifest: buildTransferredApplicationManifest({
        applicationUniversalIdentifier,
        roleUniversalIdentifier: uuidv4(),
        objectUniversalIdentifier: uuidv4(),
        nameSingular: buildTransferredObjectNameSingular('transferCollision'),
      }),
    });

    await globalThis.testDataSource.query(
      `INSERT INTO core."file" ("id", "workspaceId", "applicationId", "path", "size")
       VALUES ($1, $2, $3, $4, 0)`,
      [
        collidingFileId,
        SEED_APPLE_WORKSPACE_ID,
        workspaceCustomApplicationId,
        `${FileFolder.BuiltLogicFunction}/${TRANSFERRED_BUILT_HANDLER_PATH}`,
      ],
    );
  }, 120000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE "id" = $1`,
      [collidingFileId],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  }, 120000);

  it('should refuse a transfer colliding with a custom application file and change nothing', async () => {
    const rowsOwnedBeforeTransfer =
      await findRowsOwnedByApplication(sourceApplicationId);
    const workspaceCustomRowCountBeforeTransfer = (
      await findRowsOwnedByApplication(workspaceCustomApplicationId)
    ).length;

    const { exitCode, output } =
      await runTransferApplicationToWorkspaceCustomApplicationCommand({
        applicationUniversalIdentifier,
      });

    expect(exitCode).toBe(1);
    expect(output).toContain(
      'IDX_FILE_APPLICATION_ID_WORKSPACE_ID_PATH_UNIQUE',
    );
    expect(await findApplicationId(applicationUniversalIdentifier)).toBe(
      sourceApplicationId,
    );
    expect(await findRowsOwnedByApplication(sourceApplicationId)).toEqual(
      expect.arrayContaining(rowsOwnedBeforeTransfer),
    );
    expect(
      (await findRowsOwnedByApplication(workspaceCustomApplicationId)).length,
    ).toBe(workspaceCustomRowCountBeforeTransfer);
  }, 120000);
});
