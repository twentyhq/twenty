import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardNoteTargetViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'noteTarget'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allNoteTargetsId: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'noteTarget',
      context: {
        viewName: 'allNoteTargets',
        viewFieldName: 'id',
        fieldName: 'id',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allNoteTargetsNote: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'noteTarget',
      context: {
        viewName: 'allNoteTargets',
        viewFieldName: 'note',
        fieldName: 'note',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allNoteTargetsTarget: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'noteTarget',
      context: {
        viewName: 'allNoteTargets',
        viewFieldName: 'target',
        fieldName: 'target',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
