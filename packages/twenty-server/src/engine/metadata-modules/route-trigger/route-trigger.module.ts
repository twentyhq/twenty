import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { RouteTriggerResolver } from 'src/engine/metadata-modules/route-trigger/resolvers/route-trigger.resolver';
import { RouteTriggerController } from 'src/engine/metadata-modules/route-trigger/route-trigger.controller';
import { RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RouteTriggerService } from 'src/engine/metadata-modules/route-trigger/route-trigger.service';
import { RouteTriggerV2Service } from 'src/engine/metadata-modules/route-trigger/services/route-trigger-v2.service';
import { WorkspaceFlatRouteTriggerMapCacheService } from 'src/engine/metadata-modules/route-trigger/services/workspace-flat-route-trigger-map-cache.service';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RouteTrigger]),
    AuthModule,
    DomainManagerModule,
    ServerlessFunctionModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
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
