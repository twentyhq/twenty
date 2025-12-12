import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

export const FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES: (keyof Pick<
  FlatPageLayout,
  'name' | 'type' | 'objectMetadataId'
>)[] = ['name', 'type', 'objectMetadataId'];
