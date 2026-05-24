import { type JestConfigWithTsJest } from 'ts-jest';
import 'tsconfig-paths/register';

import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { LogicFunctionFromSourceHelperService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source-helper.service';

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
  // Expose module-scoped services that integration tests cannot import
  // directly (their transitive dependency graph contains `.mjs` files
  // which Jest's CJS transform cannot parse). Resolving them here keeps
  // those imports in the `tsx`-driven globalSetup process.
  global.logicFunctionFromSourceHelperService = app
    .select(LogicFunctionModule)
    .get(LogicFunctionFromSourceHelperService);
  global.workspaceManyOrAllFlatEntityMapsCacheService = app
    .select(WorkspaceManyOrAllFlatEntityMapsCacheModule)
    .get(WorkspaceManyOrAllFlatEntityMapsCacheService);
};
