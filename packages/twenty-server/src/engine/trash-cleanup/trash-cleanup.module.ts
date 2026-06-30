import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { TrashCleanupCronCommand } from 'src/engine/trash-cleanup/commands/trash-cleanup.cron.command';
import { TrashCleanupCronJob } from 'src/engine/trash-cleanup/crons/trash-cleanup.cron.job';
import { TrashCleanupJob } from 'src/engine/trash-cleanup/jobs/trash-cleanup.job';
import { TrashCleanupService } from 'src/engine/trash-cleanup/services/trash-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    TrashCleanupService,
    TrashCleanupJob,
    TrashCleanupCronJob,
    TrashCleanupCronCommand,
  ],
  exports: [TrashCleanupCronCommand],
})
export class TrashCleanupModule {}
