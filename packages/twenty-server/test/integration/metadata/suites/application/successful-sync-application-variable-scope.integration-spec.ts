import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type ApplicationVariableScope } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const TEST_APP_ID = 'e2b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'e2b2c3d4-0002-4000-a000-000000000002';

const VARIABLE_ID_BY_SCOPE: Record<ApplicationVariableScope, string> = {
  WORKSPACE: 'e2b2c3d4-0003-4000-a000-000000000003',
  USER: 'e2b2c3d4-0004-4000-a000-000000000004',
};

const syncRecordMyMeetingsVariable = async ({
  scope,
  value,
}: {
  scope: ApplicationVariableScope;
  value: boolean;
}) => {
  const baseManifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
  });

  await syncApplication({
    manifest: {
      ...baseManifest,
      application: {
        ...baseManifest.application,
        applicationVariables: {
          RECORD_MY_MEETINGS: {
            universalIdentifier: VARIABLE_ID_BY_SCOPE[scope],
            type: FieldMetadataType.BOOLEAN,
            value,
            scope,
          },
        },
      },
    },
    expectToFail: false,
  });
};

const findStoredApplicationVariable = async (
  universalIdentifier: string,
): Promise<{ value: string | null; defaultValue: string | null }> => {
  const [applicationVariable] = await globalThis.testDataSource.query(
    `SELECT "value", "defaultValue" FROM "core"."applicationVariable" WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

  if (!isDefined(applicationVariable)) {
    throw new Error(
      `No application variable with universalIdentifier ${universalIdentifier}`,
    );
  }

  return applicationVariable;
};

describe('Sync application should create application variables of every scope', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application Variable Scopes App',
      description: 'App for testing application variable scopes',
      sourcePath: 'test-application-variable-scopes',
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each<ApplicationVariableScope>(['WORKSPACE', 'USER'])(
    'should create a secret and required %s variable',
    async (scope) => {
      const baseManifest = buildBaseManifest({
        appId: TEST_APP_ID,
        roleId: TEST_ROLE_ID,
      });

      await syncApplication({
        manifest: {
          ...baseManifest,
          application: {
            ...baseManifest.application,
            applicationVariables: {
              [`${scope}_API_KEY`]: {
                universalIdentifier: VARIABLE_ID_BY_SCOPE[scope],
                isSecret: true,
                isRequired: true,
                scope,
              },
            },
          },
        },
        expectToFail: false,
      });

      const { data } = await findOneApplication({
        input: { universalIdentifier: TEST_APP_ID },
        gqlFields: 'applicationVariables { key scope isSecret isRequired }',
        expectToFail: false,
      });

      expect(data.findOneApplication.applicationVariables).toEqual([
        {
          key: `${scope}_API_KEY`,
          scope,
          isSecret: true,
          isRequired: true,
        },
      ]);
    },
    60000,
  );

  it.each<ApplicationVariableScope>(['WORKSPACE', 'USER'])(
    'should store the manifest value of a %s variable as its default',
    async (scope) => {
      await syncRecordMyMeetingsVariable({ scope, value: true });

      const { value, defaultValue } = await findStoredApplicationVariable(
        VARIABLE_ID_BY_SCOPE[scope],
      );

      const { data } = await findOneApplication({
        input: { universalIdentifier: TEST_APP_ID },
        gqlFields: 'applicationVariables { key value }',
        expectToFail: false,
      });

      expect(defaultValue).toBe('true');
      expect(isDefined(value)).toBe(scope === 'WORKSPACE');
      expect(data.findOneApplication.applicationVariables).toEqual([
        {
          key: 'RECORD_MY_MEETINGS',
          value: scope === 'WORKSPACE' ? 'true' : '',
        },
      ]);
    },
    60000,
  );

  it('should update the default of a user variable when the manifest value changes', async () => {
    await syncRecordMyMeetingsVariable({ scope: 'USER', value: true });
    await syncRecordMyMeetingsVariable({ scope: 'USER', value: false });

    const { value, defaultValue } = await findStoredApplicationVariable(
      VARIABLE_ID_BY_SCOPE.USER,
    );

    expect(defaultValue).toBe('false');
    expect(value).toBeNull();
  }, 60000);
});
