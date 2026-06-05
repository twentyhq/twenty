import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCallRecordingViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'callRecording'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // title is the label identifier; it must hold the lowest position in non-widget views.
    allCallRecordingsTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        viewFieldName: 'title',
        fieldName: 'title',
        position: 0,
        isVisible: true,
        size: 200,
      },
    }),
    allCallRecordingsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'allCallRecordings',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 150,
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
    callRecordingRecordPageFieldsTitle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        viewFieldName: 'title',
        fieldName: 'title',
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
    callRecordingRecordPageFieldsEndedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        viewFieldName: 'endedAt',
        fieldName: 'endedAt',
        position: 3,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    callRecordingRecordPageFieldsVideo: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        viewFieldName: 'video',
        fieldName: 'video',
        position: 4,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    callRecordingRecordPageFieldsAudio: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        viewFieldName: 'audio',
        fieldName: 'audio',
        position: 5,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    callRecordingRecordPageFieldsTranscript:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'callRecording',
        context: {
          viewName: 'callRecordingRecordPageFields',
          viewFieldName: 'transcript',
          fieldName: 'transcript',
          position: 6,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    callRecordingRecordPageFieldsSummary: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'callRecording',
      context: {
        viewName: 'callRecordingRecordPageFields',
        viewFieldName: 'summary',
        fieldName: 'summary',
        position: 7,
        isVisible: true,
        size: 200,
        viewFieldGroupName: 'general',
      },
    }),
  };
};
