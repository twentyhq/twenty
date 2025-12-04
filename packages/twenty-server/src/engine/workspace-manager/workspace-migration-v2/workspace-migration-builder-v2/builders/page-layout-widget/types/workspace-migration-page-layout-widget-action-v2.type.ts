import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export type CreatePageLayoutWidgetAction = {
  type: 'create_page_layout_widget';
  pageLayoutWidget: FlatPageLayoutWidget;
};

export type UpdatePageLayoutWidgetAction = {
  type: 'update_page_layout_widget';
  pageLayoutWidgetId: string;
  updates: FlatEntityPropertiesUpdates<FlatPageLayoutWidget>;
};

export type DeletePageLayoutWidgetAction = {
  type: 'delete_page_layout_widget';
  pageLayoutWidgetId: string;
};
