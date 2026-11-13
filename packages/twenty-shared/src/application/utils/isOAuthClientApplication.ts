import { type ApplicationOAuthClient } from '@/application/applicationOAuthClientType';
import { isDefined } from '@/utils/validation/isDefined';

export const isOAuthClientApplication = <
  TApplication extends { oAuthClient?: ApplicationOAuthClient },
>(
  application: TApplication,
): application is Extract<
  TApplication,
  { oAuthClient: ApplicationOAuthClient }
> => isDefined(application.oAuthClient);
