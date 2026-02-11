import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';

export const fromFlatViewFieldGroupToViewFieldGroupDto = (
  flatViewFieldGroup: FlatViewFieldGroup,
): ViewFieldGroupDTO => {
  const { createdAt, updatedAt, deletedAt, ...rest } = flatViewFieldGroup;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
