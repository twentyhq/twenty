import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessGroupModule } from 'src/engine/permissions/internal/access-group/access-group.module';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { RecordEventPermissionsService } from 'src/engine/permissions/record-event-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { RecordSharingReadService } from 'src/engine/permissions/internal/record-share/services/record-sharing-read.service';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AccessGroupModule,
    TypeOrmModule.forFeature([RoleTargetEntity]),
    WorkspaceCacheModule,
    RecordPermissionRepositoryModule,
  ],
  providers: [
    SettingPermissionsService,
    PermissionsMetadataMapsService,
    PrincipalPermissionsService,
    RecordEventPermissionsService,
    RecordPermissionsService,
    RecordSharingPermissionsService,
    RecordSharingReadService,
    RolePermissionsService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [
    PrincipalPermissionsService,
    RecordEventPermissionsService,
    RecordPermissionsService,
    RecordSharingPermissionsService,
    RecordSharingReadService,
    RolePermissionsService,
    SettingPermissionsService,
  ],
})
export class PermissionsModule {}
