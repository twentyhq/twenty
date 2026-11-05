import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/combine/services/permissions-metadata-maps.service';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { PermissionsPrincipalsService } from 'src/engine/permissions/principal/services/permissions-principals.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetModule } from 'src/engine/metadata-modules/role-target/role-target.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RecordShareStorageModule } from 'src/engine/permissions/record-share/record-share-storage.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, RoleTargetEntity, ApiKeyEntity]),
    WorkspaceCacheModule,
    RoleTargetModule,
    RecordShareStorageModule,
  ],
  providers: [
    ApiKeyRoleService,
    PermissionsService,
    PermissionsMetadataMapsService,
    PermissionsPrincipalsService,
    RecordAccessPolicyService,
    provideWorkspaceScopedRepository(ApiKeyEntity),
    provideWorkspaceScopedRepository(RoleEntity),
    provideWorkspaceScopedRepository(RoleTargetEntity),
  ],
  exports: [
    PermissionsMetadataMapsService,
    PermissionsService,
    PermissionsPrincipalsService,
    ApiKeyRoleService,
  ],
})
export class PermissionsModule {}
