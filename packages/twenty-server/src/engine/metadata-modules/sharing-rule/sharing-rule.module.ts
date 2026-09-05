import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { SharingRuleResolver } from 'src/engine/metadata-modules/sharing-rule/sharing-rule.resolver';
import { SharingRuleService } from 'src/engine/metadata-modules/sharing-rule/sharing-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    RowLevelPermissionModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    SharingRuleService,
    SharingRuleResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [SharingRuleService],
})
export class SharingRuleModule {}
