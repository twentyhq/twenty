import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';

export const fromFlatViewToViewDto = (flatView: FlatView): ViewDTO => {
  const { createdAt, updatedAt, deletedAt, ...rest } = flatView;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
