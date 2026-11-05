/* @license Enterprise */

import { RecordSharingResolver } from 'src/engine/permissions/record-share/resolvers/record-sharing.resolver';
import { RecordSharingWriteService } from 'src/engine/permissions/record-share/services/record-sharing-write.service';
import { Module } from '@nestjs/common';

import { PrivateRecordModule } from 'src/engine/permissions/private-record/private-record.module';
import { RecordSharingChangeModule } from 'src/engine/permissions/record-share/record-sharing-change.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { RecordShareStorageModule } from 'src/engine/permissions/record-share/record-share-storage.module';
import { ShareWithService } from 'src/engine/permissions/record-share/services/share-with.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordSharingChangeModule,
    RecordShareStorageModule,
    PrivateRecordModule,
    PermissionsModule,
  ],
  providers: [
    ShareWithService,
    RecordSharePrincipalService,
    RecordSharingWriteService,
    RecordSharingResolver,
  ],
  exports: [
    ShareWithService,
    RecordSharePrincipalService,
    RecordSharingWriteService,
  ],
})
export class RecordShareModule {}
