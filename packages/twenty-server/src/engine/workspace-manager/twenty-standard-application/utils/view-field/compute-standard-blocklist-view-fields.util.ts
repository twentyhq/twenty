import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardBlocklistViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'blocklist'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allBlocklistsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'allBlocklists',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allBlocklistsWorkspaceMember: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'allBlocklists',
        viewFieldName: 'workspaceMember',
        fieldName: 'workspaceMember',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allBlocklistsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'allBlocklists',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),

    blocklistRecordPageFieldsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    blocklistRecordPageFieldsWorkspaceMember:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'blocklist',
        context: {
          viewName: 'blocklistRecordPageFields',
          viewFieldName: 'workspaceMember',
          fieldName: 'workspaceMember',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    blocklistRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 0,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'other',
      },
    }),
    blocklistRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'blocklist',
      context: {
        viewName: 'blocklistRecordPageFields',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 1,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'other',
      },
    }),
  };
};
