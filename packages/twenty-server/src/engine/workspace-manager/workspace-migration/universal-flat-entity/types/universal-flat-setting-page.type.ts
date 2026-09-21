import { type SettingPageEntity } from 'src/engine/metadata-modules/setting-page/entities/setting-page.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatSettingPage = UniversalFlatEntityFrom<
  SettingPageEntity,
  'settingPage'
>;
