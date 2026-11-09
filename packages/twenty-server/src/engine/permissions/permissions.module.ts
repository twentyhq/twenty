import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessGroupReadModule } from 'src/engine/permissions/internal/access-group/access-group-read.module';
import { AccessGroupComputationModule } from 'src/engine/permissions/internal/access-group/access-group-computation.module';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
import { RecordAccessGroupWriteService } from 'src/engine/permissions/record-access-group-write.service';
import { RecordPermissionsOnlyRLSReadService } from 'src/engine/permissions/record-permissions-only-rls-read.service';
import { RecordPermissionsOnlyRoleReadService } from 'src/engine/permissions/record-permissions-only-role-read.service';
import { RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { RecordSharingReadService } from 'src/engine/permissions/internal/record-share/services/record-sharing-read.service';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RecordPermissionRepositoryModule } from 'src/engine/permissions/internal/record-permission-repository/record-permission-repository.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AccessGroupComputationModule,
    AccessGroupReadModule,
    TypeOrmModule.forFeature([RoleTargetEntity]),
    WorkspaceCacheModule,
    RecordPermissionRepositoryModule,
  ],
  providers: [
    SettingPermissionsService,
    PermissionsMetadataMapsService,
    PrincipalPermissionsReadService,
    RecordAccessGroupWriteService,
    RecordEventPermissionsReadService,
    RecordPermissionsReadService,
    RecordPermissionsOnlyRLSReadService,
    RecordPermissionsOnlyRoleReadService,
    RecordSharingPermissionsService,
    RecordSharingReadService,
    RolePermissionsService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [
    PrincipalPermissionsReadService,
    RecordAccessGroupWriteService,
    RecordEventPermissionsReadService,
    RecordPermissionsReadService,
    RecordPermissionsOnlyRLSReadService,
    RecordPermissionsOnlyRoleReadService,
    RecordSharingPermissionsService,
    RecordSharingReadService,
    RolePermissionsService,
    SettingPermissionsService,
  ],
})
export class PermissionsModule {}
