import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatFrontComponentModule } from 'src/engine/metadata-modules/flat-front-component/flat-front-component.module';
import { FrontComponentController } from 'src/engine/metadata-modules/front-component/controllers/front-component.controller';
import { FrontComponentResolver } from 'src/engine/metadata-modules/front-component/front-component.resolver';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    ApplicationVariableEntityModule,
    TokenModule,
    PermissionsModule,
    FlatFrontComponentModule,
    SubscriptionsModule,
    WorkspaceCacheModule,
    WorkspaceDomainsModule,
  ],
  controllers: [FrontComponentController],
  providers: [
    FrontComponentService,
    FrontComponentResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [FrontComponentService],
})
export class FrontComponentModule {}
