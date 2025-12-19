import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { ALL_METADATA_RELATION_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations-properties.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

export const fromPageLayoutWidgetEntityToFlatPageLayoutWidget = (
  pageLayoutWidgetEntity: PageLayoutWidgetEntity,
): FlatPageLayoutWidget => {
  const pageLayoutWidgetEntityWithoutRelations = removePropertiesFromRecord(
    pageLayoutWidgetEntity,
    Object.keys(
      ALL_METADATA_RELATION_PROPERTIES.pageLayoutWidget,
    ) as (keyof typeof ALL_METADATA_RELATION_PROPERTIES.pageLayoutWidget)[],
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
