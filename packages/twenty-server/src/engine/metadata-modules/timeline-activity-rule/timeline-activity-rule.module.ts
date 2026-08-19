import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TimelineActivityRuleEntity } from 'src/engine/metadata-modules/timeline-activity-rule/entities/timeline-activity-rule.entity';
import { TimelineActivityRuleGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/timeline-activity-rule/interceptors/timeline-activity-rule-graphql-api-exception.interceptor';
import { TimelineActivityRuleResolver } from 'src/engine/metadata-modules/timeline-activity-rule/timeline-activity-rule.resolver';
import { TimelineActivityRuleService } from 'src/engine/metadata-modules/timeline-activity-rule/services/timeline-activity-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimelineActivityRuleEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    PermissionsModule,
  ],
  providers: [
    TimelineActivityRuleService,
    TimelineActivityRuleResolver,
    TimelineActivityRuleGraphqlApiExceptionInterceptor,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [TimelineActivityRuleService],
})
export class TimelineActivityRuleModule {}
