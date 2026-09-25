import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { ValidationRuleGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/validation-rule/interceptors/validation-rule-graphql-api-exception.interceptor';
import { ValidationRuleResolver } from 'src/engine/metadata-modules/validation-rule/validation-rule.resolver';
import { ValidationRuleService } from 'src/engine/metadata-modules/validation-rule/validation-rule.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationModule,
    CacheLockModule,
    PermissionsModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    ValidationRuleService,
    ValidationRuleResolver,
    ValidationRuleGraphqlApiExceptionInterceptor,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [ValidationRuleService],
})
export class ValidationRuleModule {}
