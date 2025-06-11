import { JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';

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
  // @ts-expect-error legacy noImplicitAny
  global.typeOrmService = app.get(TypeORMService);
  // @ts-expect-error legacy noImplicitAny
  global.dataSourceService = app.get(DataSourceService);
  // @ts-expect-error legacy noImplicitAny
  global.dataSeedWorkspaceCommand = app.get(DataSeedWorkspaceCommand);
};
