import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsMetadataMapsService } from 'src/engine/permissions/combine/services/permissions-metadata-maps.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions/services/record-permissions.service';
import { RecordSharingReadService } from 'src/engine/permissions/record-share/services/record-sharing-read.service';
import { UserRoleReadService } from 'src/engine/permissions/role-assignment/user-role-read.service';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { PermissionsPrincipalsService } from 'src/engine/permissions/principal/services/permissions-principals.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RecordPermissionOrmModule } from 'src/engine/permissions/record-permission-orm/record-permission-orm.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleTargetEntity, UserWorkspaceEntity]),
    WorkspaceCacheModule,
    RecordPermissionOrmModule,
  ],
  providers: [
    PermissionsService,
    PermissionsMetadataMapsService,
    PermissionsPrincipalsService,
    RecordAccessPolicyService,
    RecordPermissionsService,
    RecordSharingReadService,
    UserRoleReadService,
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [PermissionsMetadataMapsService, PermissionsService],
})
export class PermissionsModule {}
