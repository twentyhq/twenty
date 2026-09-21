import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_SETTING_PAGE_EDITABLE_PROPERTIES = [
  'frontComponentId',
  'title',
  'icon',
  'position',
  'scope',
] as const satisfies MetadataEntityPropertyName<'settingPage'>[];
