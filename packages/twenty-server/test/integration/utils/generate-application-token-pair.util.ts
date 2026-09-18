import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';

// Signs through the service rather than the API so a test can bind a pair to
// any user, or leave it unbound, which the API never issues for a session.
export const generateApplicationTokenPair = (
  input: Parameters<ApplicationTokenService['generateApplicationTokenPair']>[0],
) =>
  getAppProviderByClassName<ApplicationTokenService>(
    'ApplicationTokenService',
  ).generateApplicationTokenPair(input);
