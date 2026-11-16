/* @license Enterprise */

import { Module } from '@nestjs/common';

import { ApplicationGrantRoleLookupModule } from 'src/engine/core-modules/application/application-grant-role-lookup/application-grant-role-lookup.module';
import { UserWorkspaceSuccessorModule } from 'src/engine/core-modules/user-workspace/user-workspace-successor.module';
import { PrivateRecordModule } from 'src/engine/permissions/private-record/private-record.module';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { RecordSharingResolver } from 'src/engine/permissions/record-share/resolvers/record-sharing.resolver';
import { RecordShareStorageModule } from 'src/engine/permissions/internal/record-share/record-share-storage.module';
import { RecordSharingChangeModule } from 'src/engine/permissions/record-share/record-sharing-change.module';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { RecordSharingWriteService } from 'src/engine/permissions/record-share/services/record-sharing-write.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionRepositoryModule,
    RecordSharingChangeModule,
    RecordShareStorageModule,
    PrivateRecordModule,
    PermissionsModule,
    UserWorkspaceSuccessorModule,
    ApplicationGrantRoleLookupModule,
  ],
  providers: [
    RecordSharePrincipalService,
    RecordSharingWriteService,
    RecordShareSystemWriteService,
    RecordSharingResolver,
  ],
  exports: [RecordSharingWriteService, RecordShareSystemWriteService],
})
export class RecordShareModule {}
