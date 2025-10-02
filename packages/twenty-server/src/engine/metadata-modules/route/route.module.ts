import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { RouteResolver } from 'src/engine/metadata-modules/route/resolvers/route.resolver';
import { RouteController } from 'src/engine/metadata-modules/route/route.controller';
import { Route } from 'src/engine/metadata-modules/route/route.entity';
import { RouteService } from 'src/engine/metadata-modules/route/route.service';
import { RouteV2Service } from 'src/engine/metadata-modules/route/services/route-v2.service';
import { WorkspaceFlatRouteMapCacheService } from 'src/engine/metadata-modules/route/services/workspace-flat-route-map-cache.service';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route]),
    AuthModule,
    DomainManagerModule,
    ServerlessFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
  ],
  controllers: [RouteController],
  providers: [
    RouteService,
    RouteV2Service,
    WorkspaceFlatRouteMapCacheService,
    RouteResolver,
  ],
  exports: [RouteV2Service, WorkspaceFlatRouteMapCacheService],
})
export class RouteModule {}
