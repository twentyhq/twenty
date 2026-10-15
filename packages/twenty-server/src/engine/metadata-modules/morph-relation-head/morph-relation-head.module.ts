import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MorphRelationHeadSwitchService } from 'src/engine/metadata-modules/morph-relation-head/services/morph-relation-head-switch.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    CacheLockModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [MorphRelationHeadSwitchService],
  exports: [MorphRelationHeadSwitchService],
})
export class MorphRelationHeadModule {}
