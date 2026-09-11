import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const fromFlatViewToViewDto = (flatView: FlatView): ViewDTO => {
  const effectiveFlatView = resolveEffectiveFlatEntity({
    metadataName: 'view',
    flatEntity: flatView,
  });
  const {
    createdAt,
    updatedAt,
    deletedAt,
    overrides: _overrides,
    ...rest
  } = effectiveFlatView;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
