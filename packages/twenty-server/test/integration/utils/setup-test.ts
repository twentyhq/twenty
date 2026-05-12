import { type JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { CURRENT_PRIVATE_KEY_PEM } from 'test/integration/utils/jwt-signing-key.fixture';

import { createApp } from './create-app';

process.env.JWT_SIGNING_PRIVATE_KEY = CURRENT_PRIVATE_KEY_PEM;

export default async (_: unknown, projectConfig: JestConfigWithTsJest) => {
  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await rawDataSource.initialize();

  await app.listen(projectConfig.globals.APP_PORT as number);

  global.app = app;
  global.testDataSource = rawDataSource;
};
