/* @license Enterprise */

import { Module } from '@nestjs/common';

import { AccessGroupOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/access-group-orm.service';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-query.service';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { RecordPrivacyWriteOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-privacy-write-orm.service';
import { RecordShareWriteOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-share-write-orm.service';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';

@Module({
  imports: [WorkspaceQueryExecutorModule],
  providers: [
    AccessGroupOrmService,
    RecordPermissionQueryService,
    RecordPermissionReadOrmService,
    RecordShareWriteOrmService,
    RecordPrivacyWriteOrmService,
  ],
  exports: [
    AccessGroupOrmService,
    RecordPermissionReadOrmService,
    RecordShareWriteOrmService,
    RecordPrivacyWriteOrmService,
  ],
})
export class RecordPermissionOrmModule {}
