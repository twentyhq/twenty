import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RecordEventPermissionsService } from 'src/engine/permissions/record-event-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { RecordRepositoryPermissionsService } from 'src/engine/permissions/record-repository-permissions.service';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RecordPermissionOrmModule } from 'src/engine/permissions/internal/record-permission-orm/record-permission-orm.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleTargetEntity, UserWorkspaceEntity]),
    WorkspaceCacheModule,
    RecordPermissionOrmModule,
  ],
  providers: [
    SettingPermissionsService,
    PermissionsMetadataMapsService,
    PrincipalPermissionsService,
    RecordEventPermissionsService,
    RecordPermissionsService,
    RecordRepositoryPermissionsService,
    RecordSharingPermissionsService,
    RolePermissionsService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [
    PrincipalPermissionsService,
    RecordEventPermissionsService,
    RecordPermissionsService,
    RecordRepositoryPermissionsService,
    RecordSharingPermissionsService,
    RolePermissionsService,
    SettingPermissionsService,
  ],
})
export class PermissionsModule {}
