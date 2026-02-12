import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_PAGE_LAYOUT_TAB_EDITABLE_PROPERTIES = [
  'title',
  'position',
] as const satisfies MetadataEntityPropertyName<'pageLayoutTab'>[];
