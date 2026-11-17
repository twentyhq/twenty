/* @license Enterprise */

import { Module } from '@nestjs/common';

import { RecordAccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-access-group.repository';
import { AccessGroupReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-read.repository';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { PrivateRecordRepository } from 'src/engine/permissions/internal/private-record/repositories/private-record.repository';
import { RecordShareRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-share.repository';
import { WorkspaceQueryExecutorModule } from 'src/engine/workspace-query-executor/workspace-query-executor.module';

@Module({
  imports: [WorkspaceQueryExecutorModule],
  providers: [
    RecordAccessGroupRepository,
    AccessGroupReadRepository,
    AccessGroupRepository,
    RecordPermissionQueryService,
    RecordPermissionReadRepository,
    RecordShareRepository,
    PrivateRecordRepository,
  ],
  exports: [
    RecordAccessGroupRepository,
    AccessGroupReadRepository,
    AccessGroupRepository,
    RecordPermissionReadRepository,
    RecordShareRepository,
    PrivateRecordRepository,
  ],
})
export class RecordPermissionRepositoryModule {}
