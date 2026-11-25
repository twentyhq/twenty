import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { McpServerClientModule } from 'src/engine/metadata-modules/mcp-server/mcp-server-client.module';
import { McpServerResolver } from 'src/engine/metadata-modules/mcp-server/mcp-server.resolver';
import { McpServerService } from 'src/engine/metadata-modules/mcp-server/mcp-server.service';
import { McpServerMigrationService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-migration.service';
import { McpServerSignInService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-sign-in.service';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    PermissionsModule,
    FeatureFlagModule,
    McpServerClientModule,
    TypeOrmModule.forFeature([McpServerEntity]),
  ],
  providers: [
    McpServerService,
    McpServerMigrationService,
    McpServerSignInService,
    McpServerResolver,
  ],
  exports: [McpServerService],
})
export class McpServerModule {}
