import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationPreferences } from 'test/integration/metadata/suites/application/utils/my-application-preferences.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';

describe('My application preferences should fail', () => {
  let application: ApplicationWithVariable;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Application Preferences Caller Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });

    const janeApplicationTokenPair =
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      });

    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should refuse an API key', async () => {
    const { errors } = await myApplicationPreferences({
      input: {},
      token: API_KEY_ACCESS_TOKEN,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token, even one a member is behind', async () => {
    const { errors } = await myApplicationPreferences({
      input: {},
      token: janeApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
