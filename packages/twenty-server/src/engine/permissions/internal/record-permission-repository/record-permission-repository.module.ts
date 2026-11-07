/* @license Enterprise */

import { Module } from '@nestjs/common';

import { AccessGroupRecordRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-record.repository';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { PrivateRecordRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/private-record.repository';
import { RecordShareRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-share.repository';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';

@Module({
  imports: [WorkspaceQueryExecutorModule],
  providers: [
    AccessGroupRecordRepository,
    AccessGroupRepository,
    RecordPermissionQueryService,
    RecordPermissionReadRepository,
    RecordShareRepository,
    PrivateRecordRepository,
  ],
  exports: [
    AccessGroupRecordRepository,
    AccessGroupRepository,
    RecordPermissionReadRepository,
    RecordShareRepository,
    PrivateRecordRepository,
  ],
})
export class RecordPermissionRepositoryModule {}
