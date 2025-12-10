import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardNoteViews = (
  args: Omit<CreateStandardViewArgs<'note'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allNotes: createStandardViewFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'allNotes',
        name: 'All Notes',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconNotes',
      },
    }),
  };
};
