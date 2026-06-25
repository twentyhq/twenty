import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export type SideEffectFlatEntities = {
  view: (UniversalFlatView & { id: string })[];
  viewField: UniversalFlatViewField[];
  pageLayout: UniversalFlatPageLayout[];
  pageLayoutTab: UniversalFlatPageLayoutTab[];
  pageLayoutWidget: UniversalFlatPageLayoutWidget[];
  searchFieldMetadata: UniversalFlatSearchFieldMetadata[];
  index: UniversalFlatIndexMetadata[];
};

export type SideEffectMetadataName = keyof SideEffectFlatEntities;
