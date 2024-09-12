import 'tsconfig-paths/register';

import { createApp } from './create-app';
import { getAccessToken } from './get-access-token';

export default async () => {
  console.log('setup-test');
  global.app = await createApp({});
  global.accessToken = await getAccessToken(global.app);
  console.log('setup-test done');
};
