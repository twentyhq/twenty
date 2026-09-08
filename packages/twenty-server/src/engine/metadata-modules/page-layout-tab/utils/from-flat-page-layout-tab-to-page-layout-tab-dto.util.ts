import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity.util';

export const fromFlatPageLayoutTabToPageLayoutTabDto = (
  flatPageLayoutTab: FlatPageLayoutTab,
): Omit<PageLayoutTabDTO, 'widgets'> => {
  const effectiveFlatPageLayoutTab =
    resolveEffectiveFlatEntity(flatPageLayoutTab);
  const {
    createdAt,
    updatedAt,
    deletedAt,
    widgetIds: _widgetIds,
    ...rest
  } = effectiveFlatPageLayoutTab;

  return {
    ...rest,
    isOverridden: false,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
