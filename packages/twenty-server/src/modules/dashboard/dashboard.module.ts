import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { DashboardController } from 'src/modules/dashboard/controllers/dashboard.controller';
import { DashboardResolver } from 'src/modules/dashboard/resolvers/dashboard.resolver';
import { DashboardDuplicationService } from 'src/modules/dashboard/services/dashboard-duplication.service';

@Module({
  imports: [
    AuthModule,
    PageLayoutModule,
    TwentyORMModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardDuplicationService, DashboardResolver],
  exports: [DashboardDuplicationService],
})
export class DashboardModule {}
