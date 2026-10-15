import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';

import { type MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-sync.service';
import { type MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import {
  type ApplicationPackageFetcherService,
  type RegistryTarball,
} from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';

// Runs the catalog sync against a registry that serves a single package, so
// the test never reaches npm.
export const syncMarketplaceCatalogFromRegistryPackage = async ({
  packageName,
  version,
  manifest,
  asset = null,
  dist = null,
  shouldStubRegistryTarball = true,
}: {
  packageName: string;
  version: string;
  manifest: Manifest;
  asset?: Buffer | null;
  dist?: RegistryTarball | null;
  shouldStubRegistryTarball?: boolean;
}): Promise<void> => {
  const marketplaceService =
    getAppProviderByClassName<MarketplaceService>('MarketplaceService');

  const fetchAppsFromRegistrySpy = jest
    .spyOn(marketplaceService, 'fetchAppsFromRegistry')
    .mockResolvedValue([
      { name: packageName, version, description: '', author: 'Unknown' },
    ]);
  const fetchManifestFromRegistryCdnSpy = jest
    .spyOn(marketplaceService, 'fetchManifestFromRegistryCdn')
    .mockResolvedValue(manifest);
  const fetchAssetFromRegistryCdnSpy = jest
    .spyOn(marketplaceService, 'fetchAssetFromRegistryCdn')
    .mockResolvedValue(asset);
  const findRegistryTarballSpy = shouldStubRegistryTarball
    ? jest
        .spyOn(
          getAppProviderByClassName<ApplicationPackageFetcherService>(
            'ApplicationPackageFetcherService',
          ),
          'findRegistryTarball',
        )
        .mockResolvedValue(dist)
    : undefined;

  try {
    await getAppProviderByClassName<MarketplaceCatalogSyncService>(
      'MarketplaceCatalogSyncService',
    ).syncCatalog();
  } finally {
    fetchAppsFromRegistrySpy.mockRestore();
    fetchManifestFromRegistryCdnSpy.mockRestore();
    fetchAssetFromRegistryCdnSpy.mockRestore();
    findRegistryTarballSpy?.mockRestore();
  }
};
