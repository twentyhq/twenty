import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';

export const generateApplicationAccessToken = async (
  input: Parameters<
    ApplicationTokenService['generateApplicationAccessToken']
  >[0],
): Promise<string> => {
  const { token } = await getAppProviderByClassName<ApplicationTokenService>(
    'ApplicationTokenService',
  ).generateApplicationAccessToken(input);

  return token;
};
