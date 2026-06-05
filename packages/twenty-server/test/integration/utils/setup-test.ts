import nodeFetch from 'node-fetch';
import { type JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { createApp } from './create-app';

export default async (_: unknown, projectConfig: JestConfigWithTsJest) => {
  // Route the app's global fetch through node-fetch (node:http) so MSW — which patches the
  // shared node:http builtin — intercepts clients that bottom out at global fetch (e.g. the
  // Microsoft Graph client). Native undici fetch is realm-local and escapes MSW.
  globalThis.fetch = nodeFetch as unknown as typeof globalThis.fetch;

  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await rawDataSource.initialize();

  await app.listen(projectConfig.globals.APP_PORT as number);

  global.app = app;
  global.testDataSource = rawDataSource;
};
