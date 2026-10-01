import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { SettingsMenuItemResolver } from 'src/engine/metadata-modules/settings-menu-item/settings-menu-item.resolver';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@Module({
  imports: [ApplicationTranslationCatalogModule],
  providers: [
    SettingsMenuItemResolver,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
})
export class SettingsMenuItemModule {}
