import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardTaskViews = (
  args: Omit<CreateStandardViewArgs<'task'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allTasks: createStandardViewFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'allTasks',
        name: 'All Tasks',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    byStatus: createStandardViewFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        name: 'By Status',
        type: ViewType.KANBAN,
        key: null,
        position: 1,
        icon: 'IconLayoutKanban',
        mainGroupByFieldName: 'status',
      },
    }),
    assignedToMe: createStandardViewFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        name: 'Assigned to Me',
        type: ViewType.TABLE,
        key: null,
        position: 2,
        icon: 'IconUserCircle',
        mainGroupByFieldName: 'status',
      },
    }),
  };
};
