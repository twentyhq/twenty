import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';

export const upsertApplicationRegistrationFromCatalog = (
  params: Parameters<ApplicationRegistrationService['upsertFromCatalog']>[0],
): Promise<ApplicationRegistrationEntity | null> =>
  getAppProviderByClassName<ApplicationRegistrationService>(
    'ApplicationRegistrationService',
  ).upsertFromCatalog(params);
