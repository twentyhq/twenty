import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();

describe('Preview application install', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test App for Preview',
      description: 'App for testing preview',
      sourcePath: 'test-preview-app',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should successfully preview application install', async () => {
    const graphqlOperation = {
      query: `
        query PreviewApplicationInstall($universalIdentifier: String!) {
          previewApplicationInstall(universalIdentifier: $universalIdentifier) {
            manifest
            setupPlan {
              requiresManualSetup
              items {
                type
                name
                isRequired
                canApplyAutomatically
              }
            }
            permissionPlan {
              requestedPermissions
            }
          }
        }
      `,
      variables: {
        universalIdentifier: TEST_APP_ID,
      },
    };

    const response = await makeMetadataAPIRequest(graphqlOperation);
    
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.previewApplicationInstall).toBeDefined();
    expect(response.body.data.previewApplicationInstall.manifest).toBeDefined();
    expect(response.body.data.previewApplicationInstall.setupPlan).toBeDefined();
    expect(response.body.data.previewApplicationInstall.permissionPlan).toBeDefined();
  });
});
