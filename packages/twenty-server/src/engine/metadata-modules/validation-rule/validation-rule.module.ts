import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ValidationRuleResolver } from 'src/engine/metadata-modules/validation-rule/validation-rule.resolver';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationModule,
    FeatureFlagModule,
    PermissionsModule,
    TypeORMModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ValidationRuleService,
    ValidationRuleResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [ValidationRuleService],
})
export class ValidationRuleModule {}
