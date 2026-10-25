import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type ConnectionProviderManifest,
  type MessagingProviderManifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FIRST_CONNECTION_PROVIDER_ID = uuidv4();
const SECOND_CONNECTION_PROVIDER_ID = uuidv4();
const MESSAGING_PROVIDER_ID = uuidv4();

const buildConnectionProvider = ({
  universalIdentifier,
  name,
}: {
  universalIdentifier: string;
  name: string;
}): ConnectionProviderManifest => ({
  universalIdentifier,
  name,
  displayName: name,
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://provider.example.com/authorize',
    tokenEndpoint: 'https://provider.example.com/token',
    scopes: [],
    clientIdVariable: 'CLIENT_ID',
    clientSecretVariable: 'CLIENT_SECRET',
  },
});

const CONNECTION_PROVIDERS = [
  buildConnectionProvider({
    universalIdentifier: FIRST_CONNECTION_PROVIDER_ID,
    name: 'unipile',
  }),
  buildConnectionProvider({
    universalIdentifier: SECOND_CONNECTION_PROVIDER_ID,
    name: 'unipile-sandbox',
  }),
];

const buildMessagingProvider = (
  overrides: Partial<MessagingProviderManifest> = {},
): MessagingProviderManifest => ({
  universalIdentifier: MESSAGING_PROVIDER_ID,
  name: 'linkedin-messaging',
  displayName: 'LinkedIn Messages',
  connectionProvider: { universalIdentifier: FIRST_CONNECTION_PROVIDER_ID },
  ...overrides,
});

const syncMessagingProviders = ({
  messagingProviders,
  expectToFail = false,
}: {
  messagingProviders: MessagingProviderManifest[];
  expectToFail?: boolean;
}) =>
  syncApplication({
    manifest: buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        connectionProviders: CONNECTION_PROVIDERS,
        messagingProviders,
      },
    }),
    expectToFail,
  });

const findMessagingProviders = async (): Promise<
  {
    name: string;
    connectionProviderUniversalIdentifier: string;
    sendMessageLogicFunctionUniversalIdentifier: string | null;
  }[]
> =>
  globalThis.testDataSource.query(
    `SELECT mp.name, mp."connectionProviderUniversalIdentifier",
            mp."sendMessageLogicFunctionUniversalIdentifier"
       FROM core."messagingProvider" mp
       JOIN core."application" app ON app.id = mp."applicationId"
      WHERE app."universalIdentifier" = $1`,
    [TEST_APP_ID],
  );

describe('messaging provider manifest sync', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing messaging providers',
      sourcePath: 'test-messaging-provider-sync',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('stores an ingestion-only messaging provider on its connection provider', async () => {
    await syncMessagingProviders({
      messagingProviders: [buildMessagingProvider()],
    });

    expect(await findMessagingProviders()).toEqual([
      {
        name: 'linkedin-messaging',
        connectionProviderUniversalIdentifier: FIRST_CONNECTION_PROVIDER_ID,
        sendMessageLogicFunctionUniversalIdentifier: null,
      },
    ]);
  }, 60000);

  it('refuses a connection provider that is not in the application', async () => {
    const { errors } = await syncMessagingProviders({
      messagingProviders: [
        buildMessagingProvider({
          connectionProvider: { universalIdentifier: uuidv4() },
        }),
      ],
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'was not found in this application',
    );
    expect(await findMessagingProviders()).toEqual([]);
  }, 60000);

  it('refuses a send function that is not in the application', async () => {
    const { errors } = await syncMessagingProviders({
      messagingProviders: [
        buildMessagingProvider({
          sendMessageLogicFunction: { universalIdentifier: uuidv4() },
        }),
      ],
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain('Send message logic function');
  }, 60000);

  it('refuses moving a messaging provider to another connection provider', async () => {
    await syncMessagingProviders({
      messagingProviders: [buildMessagingProvider()],
    });

    const { errors } = await syncMessagingProviders({
      messagingProviders: [
        buildMessagingProvider({
          connectionProvider: {
            universalIdentifier: SECOND_CONNECTION_PROVIDER_ID,
          },
        }),
      ],
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'connection provider cannot be changed after creation',
    );
    expect(await findMessagingProviders()).toEqual([
      expect.objectContaining({
        connectionProviderUniversalIdentifier: FIRST_CONNECTION_PROVIDER_ID,
      }),
    ]);
  }, 60000);

  it('refuses renaming a messaging provider to a name its application already uses', async () => {
    const otherMessagingProvider = buildMessagingProvider({
      universalIdentifier: uuidv4(),
      name: 'whatsapp-messaging',
      displayName: 'WhatsApp',
    });

    await syncMessagingProviders({
      messagingProviders: [buildMessagingProvider(), otherMessagingProvider],
    });

    const { errors } = await syncMessagingProviders({
      messagingProviders: [
        buildMessagingProvider(),
        { ...otherMessagingProvider, name: 'linkedin-messaging' },
      ],
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain('already exists');
  }, 60000);

  it('deletes a messaging provider the manifest no longer declares', async () => {
    await syncMessagingProviders({
      messagingProviders: [buildMessagingProvider()],
    });
    await syncMessagingProviders({ messagingProviders: [] });

    expect(await findMessagingProviders()).toEqual([]);
  }, 60000);
});
