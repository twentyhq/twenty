import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const BUILT_IN_NAMES = ['Claude', 'ChatGPT', 'Twenty CLI'];

const findManyMarketplaceAppsQuery = gql`
  query FindManyMarketplaceApps {
    findManyMarketplaceApps {
      id
      name
      logoUrl
      connectUrl
      isListed
    }
  }
`;

const findMarketplaceAppDetailQuery = gql`
  query FindMarketplaceAppDetail($universalIdentifier: String!) {
    findMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      universalIdentifier
      name
      sourceType
      connectUrl
      websiteUrl
      galleryImages
    }
  }
`;

const publicMarketplaceAppsQuery = gql`
  query PublicMarketplaceApps {
    publicMarketplaceApps {
      name
    }
  }
`;

describe('Built-in marketplace applications', () => {
  afterAll(async () => {
    await getAppProviderByClassName<CoreEntityCacheService>(
      'CoreEntityCacheService',
    ).invalidate('marketplaceCatalog', MARKETPLACE_CATALOG_CACHE_ENTITY_ID);
  });

  it('should list Claude, ChatGPT and the Twenty CLI first, each with a connect link', async () => {
    const response = await makeMetadataApiRequest({
      query: findManyMarketplaceAppsQuery,
    });

    expect(response.body.errors).toBeUndefined();

    const builtInApps = response.body.data.findManyMarketplaceApps.slice(
      0,
      BUILT_IN_NAMES.length,
    );

    expect(builtInApps.map((app: { name: string }) => app.name)).toEqual(
      BUILT_IN_NAMES,
    );

    for (const app of builtInApps) {
      expect(app.isListed).toBe(true);
      expect(app.connectUrl).toMatch(/^https:\/\//);
      expect(app.logoUrl).toMatch(/^https?:\/\/.+\/images\/oauth-clients\//);
    }
  });

  it('should describe the Twenty CLI card, not its OAuth registration', async () => {
    const response = await makeMetadataApiRequest({
      query: findMarketplaceAppDetailQuery,
      variables: {
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findMarketplaceAppDetail).toEqual({
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      name: 'Twenty CLI',
      sourceType: 'OAUTH_ONLY',
      connectUrl: expect.stringMatching(/^https:\/\/docs\.twenty\.com\//),
      websiteUrl: expect.stringMatching(/^https:\/\/docs\.twenty\.com\//),
      galleryImages: [
        expect.stringMatching(
          /^https?:\/\/.+\/images\/oauth-clients\/covers\/twenty-cli\.webp$/,
        ),
      ],
    });
  });

  it('should keep them out of the public marketplace', async () => {
    const response = await makeMetadataApiRequest(
      { query: publicMarketplaceAppsQuery },
      null,
    );

    expect(response.body.errors).toBeUndefined();

    const publicNames = response.body.data.publicMarketplaceApps.map(
      (app: { name: string }) => app.name,
    );

    for (const builtInName of BUILT_IN_NAMES) {
      expect(publicNames).not.toContain(builtInName);
    }
  });
});
