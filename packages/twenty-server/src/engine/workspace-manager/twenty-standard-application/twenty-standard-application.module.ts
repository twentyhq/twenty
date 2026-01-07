import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';

import { TwentyStandardApplicationService } from './services/twenty-standard-application.service';

@Module({
  providers: [TwentyStandardApplicationService],
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationV2Module,
    GlobalWorkspaceDataSourceModule,
  ],
  exports: [TwentyStandardApplicationService],
})
export class TwentyStandardApplicationModule {}
