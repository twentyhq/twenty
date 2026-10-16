import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';

export const upsertApplicationRegistrationFromCatalog = async (
  params: Parameters<ApplicationRegistrationService['upsertFromCatalog']>[0],
): Promise<ApplicationRegistrationEntity | null> => {
  const registryLookup = jest
    .spyOn(
      getAppProviderByClassName<ApplicationPackageFetcherService>(
        'ApplicationPackageFetcherService',
      ),
      'findRegistryTarballUrl',
    )
    .mockResolvedValue(null);

  try {
    return await getAppProviderByClassName<ApplicationRegistrationService>(
      'ApplicationRegistrationService',
    ).upsertFromCatalog(params);
  } finally {
    registryLookup.mockRestore();
  }
};
