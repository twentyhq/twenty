import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';

export const fromFlatViewFieldToViewFieldDto = (
  flatViewField: FlatViewField,
): ViewFieldDTO => {
  const { createdAt, updatedAt, deletedAt, ...rest } = flatViewField;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
