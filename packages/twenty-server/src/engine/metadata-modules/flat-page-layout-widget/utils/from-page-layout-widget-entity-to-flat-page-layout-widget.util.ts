import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { PAGE_LAYOUT_WIDGET_ENTITY_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/page-layout-widget-entity-relation-properties.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';

export const fromPageLayoutWidgetEntityToFlatPageLayoutWidget = (
  pageLayoutWidgetEntity: PageLayoutWidgetEntity,
): FlatPageLayoutWidget => {
  const pageLayoutWidgetEntityWithoutRelations = removePropertiesFromRecord(
    pageLayoutWidgetEntity,
    PAGE_LAYOUT_WIDGET_ENTITY_RELATION_PROPERTIES,
  );

  return {
    ...pageLayoutWidgetEntityWithoutRelations,
    createdAt: pageLayoutWidgetEntity.createdAt.toISOString(),
    updatedAt: pageLayoutWidgetEntity.updatedAt.toISOString(),
    deletedAt: pageLayoutWidgetEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      pageLayoutWidgetEntityWithoutRelations.universalIdentifier ??
      pageLayoutWidgetEntityWithoutRelations.id,
    applicationId: pageLayoutWidgetEntityWithoutRelations.applicationId ?? null,
  };
};
