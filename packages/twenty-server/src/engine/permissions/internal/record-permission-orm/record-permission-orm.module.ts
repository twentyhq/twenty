/* @license Enterprise */

import { Module } from '@nestjs/common';

import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-query.service';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { RecordPrivacyWriteOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-privacy-write-orm.service';
import { RecordShareWriteOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-share-write-orm.service';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';

@Module({
  imports: [WorkspaceQueryExecutorModule],
  providers: [
    RecordPermissionQueryService,
    RecordPermissionReadOrmService,
    RecordShareWriteOrmService,
    RecordPrivacyWriteOrmService,
  ],
  exports: [
    RecordPermissionReadOrmService,
    RecordShareWriteOrmService,
    RecordPrivacyWriteOrmService,
  ],
})
export class RecordPermissionOrmModule {}
