import { type JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

import { createApp } from './create-app';

export default async (_: unknown, projectConfig: JestConfigWithTsJest) => {
  const app = await createApp({});

  if (!projectConfig.globals) {
    throw new Error('No globals found in project config');
  }

  await rawDataSource.initialize();

  await app.listen(projectConfig.globals.APP_PORT as number);

  global.app = app;
  global.testDataSource = rawDataSource;
  global.dataSourceService = app.get(DataSourceService);
  global.dataSeedWorkspaceCommand = app.get(DataSeedWorkspaceCommand);
};
