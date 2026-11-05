/* @license Enterprise */

import { Module } from '@nestjs/common';

import { RecordPermissionOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-orm.service';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';

@Module({
  imports: [WorkspaceQueryExecutorModule],
  providers: [RecordPermissionOrmService],
  exports: [RecordPermissionOrmService],
})
export class RecordPermissionOrmModule {}
