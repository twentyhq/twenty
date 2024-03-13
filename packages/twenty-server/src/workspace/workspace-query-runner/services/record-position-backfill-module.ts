import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { RecordPositionQueryFactory } from 'src/workspace/workspace-query-builder/factories/record-position-query.factory';
import { RecordPositionFactory } from 'src/workspace/workspace-query-runner/factories/record-position.factory';
import { RecordPositionBackfillService } from 'src/workspace/workspace-query-runner/services/record-position-backfill-service';

@Module({
  imports: [WorkspaceDataSourceModule],
  providers: [
    RecordPositionFactory,
    RecordPositionQueryFactory,
    RecordPositionBackfillService,
  ],
  exports: [RecordPositionBackfillService],
})
export class RecordPositionBackfillModule {}
