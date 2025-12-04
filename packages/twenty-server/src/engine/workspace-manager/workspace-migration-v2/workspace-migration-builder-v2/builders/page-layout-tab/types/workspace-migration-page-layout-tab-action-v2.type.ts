import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';

export type UpdatePageLayoutTabAction = {
  type: 'update_page_layout_tab';
  flatEntityId: string;
  flatEntityUpdates: FlatEntityPropertiesUpdates<'pageLayoutTab'>;
};

export type CreatePageLayoutTabAction = {
  type: 'create_page_layout_tab';
  flatEntity: FlatPageLayoutTab;
};

export type DeletePageLayoutTabAction = {
  type: 'delete_page_layout_tab';
  flatEntityId: string;
};

