import { Module } from '@nestjs/common';

import { ApplicationGrantModule } from 'src/engine/core-modules/application/application-grant/application-grant.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

import { TwentyStandardApplicationService } from './services/twenty-standard-application.service';

@Module({
  providers: [TwentyStandardApplicationService],
  imports: [
    ApplicationGrantModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  exports: [TwentyStandardApplicationService],
})
export class TwentyStandardApplicationModule {}
