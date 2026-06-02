import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCallRecordingViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'callRecording'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allCallRecordingsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allCallRecordingsMeetingOccurrenceKey: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        viewFieldName: 'meetingOccurrenceKey',
        fieldName: 'meetingOccurrenceKey',
        position: 1,
        isVisible: true,
        size: 200,
      },
    }),
    allCallRecordingsStartedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        viewFieldName: 'startedAt',
        fieldName: 'startedAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allCallRecordingsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),

    callRecordingRecordPageFieldsMeetingOccurrenceKey:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecording',
        context: {
          viewName: 'callRecordingRecordPageFields',
          viewFieldName: 'meetingOccurrenceKey',
          fieldName: 'meetingOccurrenceKey',
          position: 0,
          isVisible: true,
          size: 200,
          viewFieldGroupName: 'general',
        },
      }),
    callRecordingRecordPageFieldsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    callRecordingRecordPageFieldsStartedAt: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'callRecording',
        context: {
          viewName: 'callRecordingRecordPageFields',
          viewFieldName: 'startedAt',
          fieldName: 'startedAt',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      },
    ),
    callRecordingRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'callRecording',
        context: {
          viewName: 'callRecordingRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      },
    ),
    callRecordingRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata(
      {
        ...args,
        objectName: 'callRecording',
        context: {
          viewName: 'callRecordingRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      },
    ),
  };
};
