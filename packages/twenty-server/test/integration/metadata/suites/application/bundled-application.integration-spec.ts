import { findManyMarketplaceAppsQueryFactory } from 'test/integration/metadata/suites/application/utils/find-many-marketplace-apps-query-factory.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { upsertApplicationRegistrationFromCatalog } from 'test/integration/metadata/suites/application/utils/upsert-application-registration-from-catalog.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { BUNDLED_APPLICATIONS } from 'src/engine/core-modules/application/application-bundled/constants/bundled-applications.constant';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

const [BUNDLED_APPLICATION] = BUNDLED_APPLICATIONS;
const UNIVERSAL_IDENTIFIER =
  BUNDLED_APPLICATION.manifest.application.universalIdentifier;
const [BUNDLED_MCP_SERVER] = BUNDLED_APPLICATION.manifest.mcpServers ?? [];

const findMarketplaceApps = async (): Promise<
  { id: string; hasMcpServers: boolean }[]
> => {
  const response = await makeMetadataApiRequest(
    findManyMarketplaceAppsQueryFactory(),
  );

  return response.body.data.findManyMarketplaceApps;
};

const findMarketplaceAppIds = async (): Promise<string[]> =>
  (await findMarketplaceApps()).map(({ id }) => id);

const setMcpServersEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
    value,
    expectToFail: false,
  });

describe('Bundled applications (integration)', () => {
  beforeAll(async () => {
    jest.useRealTimers();

    await getAppProviderByClassName<ApplicationRegistrationService>(
      'ApplicationRegistrationService',
    ).upsertBundled(BUNDLED_APPLICATION);
  });

  afterAll(async () => {
    await setMcpServersEnabled(true);
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: UNIVERSAL_IDENTIFIER,
    });
    jest.useFakeTimers();
  });

  it('should list a bundled MCP server app only while MCP servers are enabled', async () => {
    await setMcpServersEnabled(true);
    expect(await findMarketplaceAppIds()).toContain(UNIVERSAL_IDENTIFIER);

    await setMcpServersEnabled(false);
    expect(await findMarketplaceAppIds()).not.toContain(UNIVERSAL_IDENTIFIER);

    await setMcpServersEnabled(true);
  });

  it('should flag the listing as having MCP servers', async () => {
    expect(await findMarketplaceApps()).toContainEqual({
      id: UNIVERSAL_IDENTIFIER,
      hasMcpServers: true,
    });
  });

  it('should not let an npm package take over a bundled identifier', async () => {
    const registration = await upsertApplicationRegistrationFromCatalog({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      name: 'Impostor',
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: '@impostor/app',
      latestAvailableVersion: '9.9.9',
      manifest: BUNDLED_APPLICATION.manifest,
    });

    expect(registration).toBeNull();
  });

  it('should refuse a version this server does not ship', async () => {
    const { errors } = await installApplication({
      input: { universalIdentifier: UNIVERSAL_IDENTIFIER, version: '9.9.9' },
      expectToFail: true,
    });

    expect(errors?.[0]?.message).toContain(
      `this server ships ${BUNDLED_APPLICATION.version}`,
    );
  });

  it('should install the MCP server and its sign-in from the embedded manifest', async () => {
    const { errors } = await installApplication({
      input: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    });

    expect(errors).toBeUndefined();

    const mcpServers = await globalThis.testDataSource.query(
      `SELECT ms.name, ms.url, cp.type AS "connectionProviderType",
              cp."oauthDiscoveryConfig", application.version,
              application."sourceType"
       FROM core."mcpServer" ms
       JOIN core."application" application ON application.id = ms."applicationId"
       JOIN core."connectionProvider" cp ON cp.id = ms."connectionProviderId"
       WHERE application."universalIdentifier" = $1`,
      [UNIVERSAL_IDENTIFIER],
    );

    expect(mcpServers).toEqual([
      {
        name: BUNDLED_MCP_SERVER.name,
        url: BUNDLED_MCP_SERVER.url,
        connectionProviderType: 'oauth-discovery',
        oauthDiscoveryConfig: { resourceUrl: BUNDLED_MCP_SERVER.url },
        version: BUNDLED_APPLICATION.version,
        sourceType: ApplicationRegistrationSourceType.BUNDLED,
      },
    ]);
  });
});
