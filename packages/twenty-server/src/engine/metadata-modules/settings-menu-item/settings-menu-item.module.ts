import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { SettingsMenuItemResolver } from 'src/engine/metadata-modules/settings-menu-item/settings-menu-item.resolver';

@Module({
  imports: [ApplicationTranslationCatalogModule],
  providers: [SettingsMenuItemResolver],
})
export class SettingsMenuItemModule {}
