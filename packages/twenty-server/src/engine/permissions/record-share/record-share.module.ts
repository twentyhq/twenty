/* @license Enterprise */

import { RecordSharingResolver } from 'src/engine/permissions/record-share/resolvers/record-sharing.resolver';
import { RecordSharingService } from 'src/engine/permissions/record-share/services/record-sharing.service';
import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordPermissionOrmModule } from 'src/engine/permissions/record-permission-orm/record-permission-orm.module';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { RecordShareStorageModule } from 'src/engine/permissions/record-share/record-share-storage.module';
import { ShareWithService } from 'src/engine/permissions/record-share/services/share-with.service';
import { RecordPermissionsModule } from 'src/engine/permissions/record-permissions/record-permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    RecordPermissionOrmModule,
    RecordShareStorageModule,
    RecordPermissionsModule,
    PermissionsModule,
  ],
  providers: [
    ShareWithService,
    RecordSharePrincipalService,
    RecordSharingService,
    RecordSharingResolver,
  ],
  exports: [
    RecordShareStorageModule,
    ShareWithService,
    RecordSharePrincipalService,
    RecordSharingService,
  ],
})
export class RecordShareModule {}
