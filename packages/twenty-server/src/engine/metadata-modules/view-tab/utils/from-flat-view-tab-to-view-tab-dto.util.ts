import { type FlatViewTab } from 'src/engine/metadata-modules/flat-view-tab/types/flat-view-tab.type';
import { type ViewTabDTO } from 'src/engine/metadata-modules/view-tab/dtos/view-tab.dto';

export const fromFlatViewTabToViewTabDto = (
  flatViewTab: FlatViewTab,
): ViewTabDTO => {
  const { createdAt, updatedAt, deletedAt, ...rest } = flatViewTab;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
