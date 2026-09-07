import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { type Manifest } from 'twenty-shared/application';

export const TEST_CONNECTION_PROVIDER_NAME = 'linear';

export const buildConnectionProviderManifest = ({
  appId,
  roleId,
  providerId,
}: {
  appId: string;
  roleId: string;
  providerId: string;
}): Manifest =>
  buildBaseManifest({
    appId,
    roleId,
    overrides: {
      connectionProviders: [
        {
          universalIdentifier: providerId,
          name: TEST_CONNECTION_PROVIDER_NAME,
          displayName: 'Linear',
          type: 'oauth',
          oauth: {
            authorizationEndpoint: 'https://linear.app/oauth/authorize',
            tokenEndpoint: 'https://api.linear.app/oauth/token',
            scopes: ['read'],
            clientIdVariable: 'LINEAR_CLIENT_ID',
            clientSecretVariable: 'LINEAR_CLIENT_SECRET',
          },
        },
      ],
    },
  });
