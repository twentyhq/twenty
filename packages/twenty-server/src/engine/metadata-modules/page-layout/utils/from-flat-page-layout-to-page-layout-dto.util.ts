import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';

export const fromFlatPageLayoutToPageLayoutDto = (
  flatPageLayout: FlatPageLayout,
): Omit<PageLayoutDTO, 'tabs'> => {
  const {
    createdAt,
    updatedAt,
    deletedAt,
    tabIds: _tabIds,
    ...rest
  } = flatPageLayout;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
