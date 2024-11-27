import { JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';

import { createApp } from './create-app';

export default async (_, projectConfig: JestConfigWithTsJest) => {
  try {
    const rawDataSourceConnection = await rawDataSource.initialize();

    console.log('Raw data source connection initialized');
    global.rawDataSourceConnection = rawDataSourceConnection;
  } catch (error) {
    console.error('Error initializing raw data source connection');
  }

  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await app.listen(projectConfig.globals.APP_PORT);

  global.app = app;
};
