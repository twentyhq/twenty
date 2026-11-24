import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { getViewVisibilityFromIsPrivate } from 'src/engine/metadata-modules/view/utils/get-view-visibility-from-is-private.util';

export const fromFlatViewToViewDto = (flatView: FlatView): ViewDTO => {
  const effectiveFlatView = resolveEffectiveFlatEntity({
    metadataName: 'view',
    flatEntity: flatView,
  });
  const { createdAt, updatedAt, deletedAt, ...rest } = effectiveFlatView;

  return {
    ...rest,
    visibility: getViewVisibilityFromIsPrivate(rest.isPrivate),
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
