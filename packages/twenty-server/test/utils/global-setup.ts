import { INestApplication } from '@nestjs/common';

import { createApp } from './create-app';
import { getAccessToken } from './get-access-token';

let app: INestApplication;
let accessToken: string;

export const setup = async () => {
  if (!app) {
    [app] = await createApp({});
    accessToken = await getAccessToken(app);
  }

  return { app, accessToken };
};

export const teardown = async () => {
  if (app) {
    await app.close();
  }
};

export default setup;
