import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { type ExtractEntityRelatedSyncableEntityProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-entity-related-syncable-entity-properties.type';

export type PageLayoutWidgetEntityRelationProperties =
  ExtractEntityRelatedSyncableEntityProperties<PageLayoutWidgetEntity>;

export type FlatPageLayoutWidget = FlatEntityFrom<
  PageLayoutWidgetEntity,
  PageLayoutWidgetEntityRelationProperties
>;
