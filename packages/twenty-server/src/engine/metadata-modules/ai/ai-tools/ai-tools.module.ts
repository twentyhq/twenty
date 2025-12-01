import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ToolModule } from 'src/engine/core-modules/tool/tool.module';
import { SearchArticlesTool } from 'src/engine/core-modules/tool/tools/search-articles-tool/search-articles-tool';
import { ToolAdapterService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool-adapter.service';
import { ToolService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspacePermissionsCacheModule } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, FileEntity]),
    FileModule,
    TokenModule,
    FeatureFlagModule,
    RecordCrudModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspacePermissionsCacheModule,
    WorkspaceCacheStorageModule,
    UserRoleModule,
    TwentyORMModule,
    MessagingModule,
    PermissionsModule,
    ToolModule,
    WorkspaceCacheModule,
  ],
  providers: [ToolService, ToolAdapterService, SearchArticlesTool],
  exports: [ToolService, ToolAdapterService, SearchArticlesTool],
})
export class AiToolsModule {}
