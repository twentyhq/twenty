import crypto from 'crypto';

import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { findOneApplicationIdByUniversalIdentifier } from 'test/integration/secret-encryption/utils/find-one-application.util';
import { updateOneApplicationVariable } from 'test/integration/secret-encryption/utils/update-one-application-variable.util';

const TEST_APP_ID = crypto.randomUUID();
const TEST_ROLE_ID = crypto.randomUUID();
const VARIABLE_ID = crypto.randomUUID();
const VARIABLE_KEY = 'API_KEY';
const OPERATOR_SET_VALUE = 'operator-entered-api-key';

const buildManifest = ({
  isDeprecated,
}: {
  isDeprecated?: boolean;
}): Manifest => {
  const baseManifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
  });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      applicationVariables: {
        [VARIABLE_KEY]: {
          universalIdentifier: VARIABLE_ID,
          description: 'Third-party API key',
          ...(isDefined(isDeprecated) && { isDeprecated }),
        },
      },
    },
  };
};

const readVariableRow = async () => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT key, value, "isDeprecated" FROM core."applicationVariable"
     WHERE "universalIdentifier" = $1`,
    [VARIABLE_ID],
  );

  return row;
};

describe('Manifest sync - deprecating an application variable', () => {
  let applicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Deprecated Variable App',
      description: 'App for testing application variable deprecation',
      sourcePath: 'test-application-variable-is-deprecated',
    });

    await syncApplication({
      manifest: buildManifest({}),
      expectToFail: false,
    });

    applicationId = await findOneApplicationIdByUniversalIdentifier({
      universalIdentifier: TEST_APP_ID,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should default isDeprecated to false when the manifest omits it', async () => {
    const row = await readVariableRow();

    expect(row.key).toBe(VARIABLE_KEY);
    expect(row.isDeprecated).toBe(false);
  });

  it('should flip isDeprecated on re-sync while preserving the operator-set value', async () => {
    await updateOneApplicationVariable({
      key: VARIABLE_KEY,
      value: OPERATOR_SET_VALUE,
      applicationId,
    });

    const { value: valueBeforeDeprecation } = await readVariableRow();

    expect(valueBeforeDeprecation).toMatch(/^enc:v2:/);

    await syncApplication({
      manifest: buildManifest({ isDeprecated: true }),
      expectToFail: false,
    });

    const rowAfterDeprecation = await readVariableRow();

    expect(rowAfterDeprecation.isDeprecated).toBe(true);
    expect(rowAfterDeprecation.value).toBe(valueBeforeDeprecation);
  });

  it('should still expose a deprecated variable to the application', async () => {
    const { data } = await makeMetadataAPIRequest({
      query: gql`
        query FindAppVariablesForDeprecatedVariableTest(
          $universalIdentifier: UUID!
        ) {
          findOneApplication(universalIdentifier: $universalIdentifier) {
            applicationVariables {
              key
              value
              isDeprecated
            }
          }
        }
      `,
      variables: { universalIdentifier: TEST_APP_ID },
    }).then((response) => response.body);

    expect(data.findOneApplication.applicationVariables).toEqual([
      {
        key: VARIABLE_KEY,
        value: OPERATOR_SET_VALUE,
        isDeprecated: true,
      },
    ]);
  });
});
