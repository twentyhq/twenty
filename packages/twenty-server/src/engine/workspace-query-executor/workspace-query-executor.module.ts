import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';

@Module({
  imports: [TypeORMModule],
  providers: [WorkspaceQueryExecutorService],
  exports: [WorkspaceQueryExecutorService],
})
export class WorkspaceQueryExecutorModule {}
