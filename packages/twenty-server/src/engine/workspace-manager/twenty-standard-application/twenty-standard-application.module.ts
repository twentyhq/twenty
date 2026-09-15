import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

import { TwentyStandardApplicationService } from './services/twenty-standard-application.service';

@Module({
  providers: [TwentyStandardApplicationService],
  imports: [
    ApplicationModule,
    TwentyConfigModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    TwentyOrmModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  exports: [TwentyStandardApplicationService],
})
export class TwentyStandardApplicationModule {}
