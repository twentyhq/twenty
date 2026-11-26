import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';

export const fromFlatViewGroupToViewGroupDto = (
  flatViewGroup: FlatViewGroup,
): ViewGroupDTO => {
  const { createdAt, updatedAt, ...rest } = flatViewGroup;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
  };
};
