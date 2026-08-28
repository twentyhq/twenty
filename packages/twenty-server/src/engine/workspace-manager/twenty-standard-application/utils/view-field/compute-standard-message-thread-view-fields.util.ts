import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageThreadViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageThread'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageThreadsSubject: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageThread',
      context: {
        viewName: 'allMessageThreads',
        viewFieldName: 'subject',
        fieldName: 'subject',
        position: 0,
        isVisible: true,
        size: 300,
      },
    }),
    allMessageThreadsMessages: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageThread',
      context: {
        viewName: 'allMessageThreads',
        viewFieldName: 'messages',
        fieldName: 'messages',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageThreadsUpdatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageThread',
      context: {
        viewName: 'allMessageThreads',
        viewFieldName: 'updatedAt',
        fieldName: 'updatedAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageThreadsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageThread',
      context: {
        viewName: 'allMessageThreads',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
