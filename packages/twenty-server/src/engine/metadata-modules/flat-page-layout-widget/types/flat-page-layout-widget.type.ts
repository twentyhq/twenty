import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-syncable-entity-properties.type';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

export type PageLayoutWidgetEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<PageLayoutWidgetEntity>;

export type FlatPageLayoutWidget = FlatEntityFrom<
  PageLayoutWidgetEntity,
  PageLayoutWidgetEntityRelationProperties
>;
