import { type Response } from 'supertest';
import { isDefined } from 'twenty-shared/utils';

import { CONNECTION_PROVIDER_FLOW_COOKIE_NAME } from 'src/engine/core-modules/application/connection-provider/constants/connection-provider-flow-cookie-name.constant';

export const readFlowCookie = (response: Response): string | undefined => {
  const setCookie: string | string[] | undefined =
    response.headers['set-cookie'];
  const cookies = Array.isArray(setCookie)
    ? setCookie
    : isDefined(setCookie)
      ? [setCookie]
      : [];

  return cookies
    .find((cookie) =>
      cookie.startsWith(`${CONNECTION_PROVIDER_FLOW_COOKIE_NAME}=`),
    )
    ?.split(';')[0];
};
