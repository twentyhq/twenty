/* @license Enterprise */

import { Module } from '@nestjs/common';

import { PrivateRecordModule } from 'src/engine/permissions/internal/private-record/private-record.module';
import { RecordPermissionOrmModule } from 'src/engine/permissions/internal/record-permission-orm/record-permission-orm.module';
import { RecordSharingResolver } from 'src/engine/permissions/internal/record-share/resolvers/record-sharing.resolver';
import { RecordShareStorageModule } from 'src/engine/permissions/internal/record-share/record-share-storage.module';
import { RecordSharingChangeModule } from 'src/engine/permissions/internal/record-share/record-sharing-change.module';
import { RecordSharePrincipalService } from 'src/engine/permissions/internal/record-share/services/record-share-principal.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordSharingWriteService } from 'src/engine/permissions/record-share/services/record-sharing-write.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionOrmModule,
    RecordSharingChangeModule,
    RecordShareStorageModule,
    PrivateRecordModule,
    PermissionsModule,
  ],
  providers: [
    RecordSharePrincipalService,
    RecordSharingWriteService,
    RecordSharingResolver,
  ],
  exports: [RecordSharingWriteService],
})
export class RecordShareModule {}
