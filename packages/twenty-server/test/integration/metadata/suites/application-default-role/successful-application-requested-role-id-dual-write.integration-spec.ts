import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type ApplicationRoleColumns = {
  defaultRoleId: string | null;
  requestedRoleId: string | null;
};

const findStandardAndCustomApplicationRoleColumns = async (
  workspaceId: string,
): Promise<ApplicationRoleColumns[]> =>
  globalThis.testDataSource.query(
    `SELECT application."defaultRoleId", application."requestedRoleId"
     FROM core."application" application
     JOIN core."workspace" workspace ON workspace.id = application."workspaceId"
     WHERE workspace.id = $1
       AND (application.id = workspace."workspaceCustomApplicationId"
         OR application."universalIdentifier" = $2)`,
    [workspaceId, TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  );

describe('Application requestedRoleId is written alongside defaultRoleId', () => {
  it.each([SEED_APPLE_WORKSPACE_ID, SEED_YCOMBINATOR_WORKSPACE_ID])(
    'sets it on the standard and custom applications of workspace %s',
    async (workspaceId) => {
      const applications =
        await findStandardAndCustomApplicationRoleColumns(workspaceId);

      expect(applications).toHaveLength(2);

      for (const { defaultRoleId, requestedRoleId } of applications) {
        expect(defaultRoleId).not.toBeNull();
        expect(requestedRoleId).toBe(defaultRoleId);
      }
    },
  );

  describe('on a synced application', () => {
    let application: ApplicationWithVariable;

    beforeAll(async () => {
      application = await setupApplicationWithVariable({
        name: 'Requested Role Dual Write Application',
        variableKey: 'API_KEY',
      });
    }, 120000);

    afterAll(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    });

    it('sets it to the role its manifest requests', async () => {
      const [{ defaultRoleId, requestedRoleId }]: ApplicationRoleColumns[] =
        await globalThis.testDataSource.query(
          'SELECT "defaultRoleId", "requestedRoleId" FROM core."application" WHERE id = $1',
          [application.id],
        );

      expect(requestedRoleId).toBe(application.requestedRoleId);
      expect(defaultRoleId).toBe(requestedRoleId);
    });
  });
});
