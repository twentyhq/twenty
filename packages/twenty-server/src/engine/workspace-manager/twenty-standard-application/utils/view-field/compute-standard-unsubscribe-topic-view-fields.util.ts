import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardUnsubscribeTopicViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'unsubscribeTopic'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allUnsubscribeTopicsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'unsubscribeTopic',
      context: {
        viewName: 'allUnsubscribeTopics',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 300,
      },
    }),
    allUnsubscribeTopicsDescription: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'unsubscribeTopic',
      context: {
        viewName: 'allUnsubscribeTopics',
        viewFieldName: 'description',
        fieldName: 'description',
        position: 1,
        isVisible: true,
        size: 300,
      },
    }),
    allUnsubscribeTopicsVisibility: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'unsubscribeTopic',
      context: {
        viewName: 'allUnsubscribeTopics',
        viewFieldName: 'visibility',
        fieldName: 'visibility',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allUnsubscribeTopicsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'unsubscribeTopic',
      context: {
        viewName: 'allUnsubscribeTopics',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
