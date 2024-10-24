import { JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { createApp } from './create-app';

export default async (_, projectConfig: JestConfigWithTsJest) => {
  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await app.listen(projectConfig.globals.APP_PORT);

  global.app = app;
};
