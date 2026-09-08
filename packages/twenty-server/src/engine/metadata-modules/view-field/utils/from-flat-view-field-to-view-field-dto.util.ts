import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity.util';

export const fromFlatViewFieldToViewFieldDto = (
  flatViewField: FlatViewField,
): ViewFieldDTO => {
  const effectiveFlatViewField = resolveEffectiveFlatEntity(flatViewField);
  const {
    createdAt,
    updatedAt,
    deletedAt,
    overrides: _overrides,
    ...rest
  } = effectiveFlatViewField;

  return {
    ...rest,
    isOverridden: false,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
