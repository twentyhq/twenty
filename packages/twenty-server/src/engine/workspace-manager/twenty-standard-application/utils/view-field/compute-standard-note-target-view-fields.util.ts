import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardNoteTargetViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'noteTarget'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // Label identifier for junction tables
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
    // All morph targets are included so the surviving field after dedup always has a viewField
    allNoteTargetsTargetPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'noteTarget',
      context: {
        viewName: 'allNoteTargets',
        viewFieldName: 'targetPerson',
        fieldName: 'targetPerson',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allNoteTargetsTargetCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'noteTarget',
      context: {
        viewName: 'allNoteTargets',
        viewFieldName: 'targetCompany',
        fieldName: 'targetCompany',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allNoteTargetsTargetOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'noteTarget',
      context: {
        viewName: 'allNoteTargets',
        viewFieldName: 'targetOpportunity',
        fieldName: 'targetOpportunity',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
