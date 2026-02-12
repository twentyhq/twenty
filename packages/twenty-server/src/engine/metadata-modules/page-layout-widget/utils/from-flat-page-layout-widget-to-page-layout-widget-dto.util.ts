import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

export const fromFlatPageLayoutWidgetToPageLayoutWidgetDto = (
  flatPageLayoutWidget: FlatPageLayoutWidget,
): PageLayoutWidgetDTO => {
  const { createdAt, updatedAt, deletedAt, objectMetadataId, ...rest } =
    flatPageLayoutWidget;

  return {
    ...rest,
    objectMetadataId: objectMetadataId ?? undefined,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : undefined,
  };
};
