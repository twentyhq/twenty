import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

export const fromPageLayoutWidgetEntityToFlatPageLayoutWidget = (
  pageLayoutWidgetEntity: PageLayoutWidgetEntity,
): FlatPageLayoutWidget => {
  const pageLayoutWidgetEntityWithoutRelations = removePropertiesFromRecord(
    pageLayoutWidgetEntity,
    getMetadataEntityRelationProperties('pageLayoutWidget'),
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
