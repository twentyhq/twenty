import { type Response } from 'supertest';

import {
  CONNECTION_PROVIDER_FLOW_COOKIE_NAME,
  CONNECTION_PROVIDER_FLOW_SECURE_COOKIE_NAME,
} from 'src/engine/core-modules/application/connection-provider/constants/connection-provider-flow-cookie-name.constant';

const FLOW_COOKIE_NAMES = [
  CONNECTION_PROVIDER_FLOW_COOKIE_NAME,
  CONNECTION_PROVIDER_FLOW_SECURE_COOKIE_NAME,
];

export const readFlowCookie = (response: Response): string | undefined => {
  const cookies: string[] = [response.headers['set-cookie'] ?? []].flat();

  return cookies
    .find((cookie) =>
      FLOW_COOKIE_NAMES.some((name) => cookie.startsWith(`${name}=`)),
    )
    ?.split(';')[0];
};
