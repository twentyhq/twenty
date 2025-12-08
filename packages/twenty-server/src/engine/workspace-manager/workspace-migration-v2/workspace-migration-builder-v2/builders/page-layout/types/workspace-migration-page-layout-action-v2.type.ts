import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';

export type UpdatePageLayoutAction = {
  type: 'update_page_layout';
  flatEntityId: string;
  flatEntityUpdates: FlatEntityPropertiesUpdates<'pageLayout'>;
};

export type CreatePageLayoutAction = {
  type: 'create_page_layout';
  flatEntity: FlatPageLayout;
};

export type DeletePageLayoutAction = {
  type: 'delete_page_layout';
  flatEntityId: string;
};
