import { JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { createApp } from './create-app';

// @ts-expect-error legacy noImplicitAny
export default async (_, projectConfig: JestConfigWithTsJest) => {
  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await rawDataSource.initialize();

  await app.listen(projectConfig.globals.APP_PORT);

  // @ts-expect-error legacy noImplicitAny
  global.app = app;
  // @ts-expect-error legacy noImplicitAny
  global.testDataSource = rawDataSource;
};
