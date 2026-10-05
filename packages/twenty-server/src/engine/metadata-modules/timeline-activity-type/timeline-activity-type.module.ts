import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { TimelineActivityTypeResolver } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.resolver';
import { TimelineActivityTypeService } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.service';
import { TimelineActivityTypeGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/timeline-activity-type/interceptors/timeline-activity-type-graphql-api-exception.interceptor';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationModule,
    PermissionsModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    TimelineActivityTypeService,
    TimelineActivityTypeResolver,
    TimelineActivityTypeGraphqlApiExceptionInterceptor,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [TimelineActivityTypeService],
})
export class TimelineActivityTypeModule {}
