import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RouteTriggerResolver } from 'src/engine/metadata-modules/route-trigger/resolvers/route-trigger.resolver';
import { RouteTriggerController } from 'src/engine/metadata-modules/route-trigger/route-trigger.controller';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';
import { RouteTriggerV2Service } from 'src/engine/metadata-modules/route-trigger/services/route-trigger-v2.service';
import { WorkspaceFlatRouteTriggerMapCacheService } from 'src/engine/metadata-modules/route-trigger/services/workspace-flat-route-trigger-map-cache.service';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteTriggerEntity]),
    ApplicationModule,
    TokenModule,
    WorkspaceDomainsModule,
    ServerlessFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    WorkspaceMigrationV2Module,
  ],
  controllers: [RouteTriggerController],
  providers: [
    RouteTriggerService,
    RouteTriggerV2Service,
    WorkspaceFlatRouteTriggerMapCacheService,
    RouteTriggerResolver,
  ],
  exports: [RouteTriggerV2Service, WorkspaceFlatRouteTriggerMapCacheService],
})
export class RouteTriggerModule {}
