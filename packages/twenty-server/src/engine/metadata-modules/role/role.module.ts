import { Module } from '@nestjs/common';

import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { FlatAgentModule } from 'src/engine/metadata-modules/flat-agent/flat-agent.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatRoleTargetMapCacheService } from 'src/engine/metadata-modules/flat-role-target/services/workspace-flat-role-target-map-cache.service';
import { ObjectPermissionModule } from 'src/engine/metadata-modules/object-permission/object-permission.module';
import { RolePermissionFlagModule } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleResolver } from 'src/engine/metadata-modules/role/role.resolver';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { WorkspaceFlatRoleMapCacheService } from 'src/engine/metadata-modules/role/services/workspace-flat-role-map-cache.service';
import { RoleToolWorkspaceService } from 'src/engine/metadata-modules/role/tools/services/role-tool.workspace-service';
import { WorkspaceRoleIdsWithAllRecordsAccessCacheService } from 'src/engine/metadata-modules/role/services/workspace-role-ids-with-all-records-access-cache.service';
import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    UserRoleModule,
    AiAgentRoleModule,
    ApplicationModule,
    ApiKeyModule,
    PermissionsModule,
    ObjectPermissionModule,
    RolePermissionFlagModule,
    RowLevelPermissionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    FlatAgentModule,
  ],
  providers: [
    RoleService,
    RoleResolver,
    RoleToolWorkspaceService,
    WorkspaceFlatRoleMapCacheService,
    WorkspaceFlatRoleTargetMapCacheService,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
    WorkspaceRolesPermissionsCacheService,
    WorkspaceRoleIdsWithAllRecordsAccessCacheService,
  ],
  exports: [
    RoleService,
    RoleToolWorkspaceService,
    WorkspaceFlatRoleMapCacheService,
    WorkspaceFlatRoleTargetMapCacheService,
  ],
})
export class RoleModule {}
