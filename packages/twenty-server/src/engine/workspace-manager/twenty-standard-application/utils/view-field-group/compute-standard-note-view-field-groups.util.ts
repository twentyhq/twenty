import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardNoteViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'note'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    noteRecordPageFieldsGeneral: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'noteRecordPageFields',
        viewFieldGroupName: 'general',
        name: 'General',
        position: 0,
        isVisible: true,
      },
    }),
    noteRecordPageFieldsAdditional: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'noteRecordPageFields',
        viewFieldGroupName: 'additional',
        name: 'Additional',
        position: 1,
        isVisible: true,
      },
    }),
    noteRecordPageFieldsOther: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'noteRecordPageFields',
        viewFieldGroupName: 'other',
        name: 'Other',
        position: 2,
        isVisible: true,
      },
    }),
  };
};
