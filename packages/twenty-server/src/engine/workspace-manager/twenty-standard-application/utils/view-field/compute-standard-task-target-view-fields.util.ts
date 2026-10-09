import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardTaskTargetViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'taskTarget'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allTaskTargetsId: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'taskTarget',
      context: {
        viewName: 'allTaskTargets',
        viewFieldName: 'id',
        fieldName: 'id',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allTaskTargetsTask: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'taskTarget',
      context: {
        viewName: 'allTaskTargets',
        viewFieldName: 'task',
        fieldName: 'task',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allTaskTargetsTarget: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'taskTarget',
      context: {
        viewName: 'allTaskTargets',
        viewFieldName: 'target',
        fieldName: 'target',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
