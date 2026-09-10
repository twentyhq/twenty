import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const fromFlatViewFieldGroupToViewFieldGroupDto = (
  flatViewFieldGroup: FlatViewFieldGroup,
): ViewFieldGroupDTO => {
  const effectiveFlatViewFieldGroup = resolveEffectiveFlatEntity({
    metadataName: 'viewFieldGroup',
    flatEntity: flatViewFieldGroup,
  });
  const { createdAt, updatedAt, deletedAt, ...rest } =
    effectiveFlatViewFieldGroup;

  return {
    ...rest,
    isOverridden: false,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
