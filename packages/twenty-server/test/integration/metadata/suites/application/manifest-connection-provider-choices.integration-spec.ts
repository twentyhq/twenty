import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findApplicationConnectionProviders } from 'test/integration/metadata/suites/connection-provider/utils/find-application-connection-providers.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { type ConnectionProviderManifest } from 'twenty-shared/application';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';
import { v4 } from 'uuid';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const ROLE_IDENTIFIER = v4();

const buildManifest = (allowedVisibilities?: unknown) =>
  buildBaseManifest({
    appId: APPLICATION_IDENTIFIER,
    roleId: ROLE_IDENTIFIER,
    overrides: {
      connectionProviders: [
        {
          universalIdentifier: PROVIDER_IDENTIFIER,
          name: 'visibility-provider',
          displayName: 'Visibility provider',
          type: 'oauth',
          allowedVisibilities:
            allowedVisibilities as ConnectionProviderManifest['allowedVisibilities'],
          oauth: {
            authorizationEndpoint: 'https://example.com/authorize',
            tokenEndpoint: 'https://example.com/token',
            scopes: ['read'],
            clientIdVariable: 'CLIENT_ID',
            clientSecretVariable: 'CLIENT_SECRET',
          },
        },
      ],
    },
  });

describe('Connection provider choices in application manifests', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'Connection choices',
      description: 'Manifest connection choices regression tests',
      sourcePath: 'manifest-connection-choices',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
  });

  it('persists declarations and restores both choices when omitted on update', async () => {
    const declarations: Array<ConnectedAccountVisibility[] | undefined> = [
      undefined,
      ['user'],
      ['workspace'],
      ['workspace', 'user'],
      undefined,
    ];

    for (const allowedVisibilities of declarations) {
      const { errors } = await syncApplication({
        manifest: buildManifest(allowedVisibilities),
      });
      expect(errors).toBeUndefined();

      const [provider] = await findConnectionProvidersByApplication(
        APPLICATION_IDENTIFIER,
      );
      const expectedChoices = allowedVisibilities ?? ['user', 'workspace'];
      expect(provider.allowedVisibilities).toEqual(expectedChoices);

      const result = await findApplicationConnectionProviders({
        input: { applicationId: provider.applicationId },
        gqlFields: 'id allowedVisibilities',
      });
      expect(result.errors).toBeUndefined();
      expect(result.data.applicationConnectionProviders).toEqual([
        { id: provider.id, allowedVisibilities: expectedChoices },
      ]);
    }
  }, 120000);

  describe.each(['create', 'update'] as const)('%s validation', (operation) => {
    it.each([
      { title: 'an empty list', value: [] },
      { title: 'duplicate choices', value: ['user', 'user'] },
      { title: 'an unknown choice', value: ['workspace', 'team'] },
      { title: 'uppercase values', value: ['USER'] },
      { title: 'a string', value: 'user' },
      { title: 'null', value: null },
    ])(
      'rejects $title without changing the saved declaration',
      async ({ value }) => {
        if (operation === 'update') {
          const { errors } = await syncApplication({
            manifest: buildManifest(['workspace']),
          });
          expect(errors).toBeUndefined();
        }

        const { errors } = await syncApplication({
          manifest: buildManifest(value),
          expectToFail: true,
        });
        expectOneNotInternalServerErrorSnapshot({ errors });

        const providers = await findConnectionProvidersByApplication(
          APPLICATION_IDENTIFIER,
        );
        if (operation === 'update') {
          expect(providers).toHaveLength(1);
          expect(providers[0].allowedVisibilities).toEqual(['workspace']);
        } else {
          expect(providers).toHaveLength(0);
        }
      },
      60000,
    );
  });
});
