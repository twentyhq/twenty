import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardNoteViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'note'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allNotesTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'allNotes',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allNotesNoteTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'allNotes',
        viewFieldName: 'noteTargets',
        fieldName: 'noteTargets',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allNotesBodyV2: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'allNotes',
        viewFieldName: 'bodyV2',
        fieldName: 'bodyV2',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allNotesCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'allNotes',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allNotesCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'allNotes',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),

    // noteRecordPageFields view fields
    // General group
    noteRecordPageFieldsNoteTargets: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'noteRecordPageFields',
        viewFieldName: 'noteTargets',
        fieldName: 'noteTargets',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    noteRecordPageFieldsAttachments: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'note',
      context: {
        viewName: 'noteRecordPageFields',
        viewFieldName: 'attachments',
        fieldName: 'attachments',
        position: 2,
        isVisible: false,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    noteRecordPageFieldsTimelineActivities: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'note',
        context: {
          viewName: 'noteRecordPageFields',
          viewFieldName: 'timelineActivities',
          fieldName: 'timelineActivities',
          position: 3,
          isVisible: false,
          size: 150,
          viewFieldGroupName: 'general',
        },
      },
    ),
  };
};
