import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { SeedObjectDefaultViewService } from 'src/engine/metadata-modules/view/services/seed-object-default-view.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [ApplicationModule, WorkspaceCacheModule, WorkspaceMigrationModule],
  providers: [SeedObjectDefaultViewService],
  exports: [SeedObjectDefaultViewService],
})
export class SeedObjectDefaultViewModule {}
