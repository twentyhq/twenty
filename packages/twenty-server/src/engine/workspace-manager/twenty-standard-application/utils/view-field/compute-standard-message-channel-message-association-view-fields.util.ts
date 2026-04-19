import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageChannelMessageASsociationViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'messageChannelMessageASsociation'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allMessageChannelMessageASsociationsMessageChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'allMessageChannelMessageASsociations',
          viewFieldName: 'messageChannelId',
          fieldName: 'messageChannelId',
          position: 0,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageASsociationsMessage:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'allMessageChannelMessageASsociations',
          viewFieldName: 'message',
          fieldName: 'message',
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageASsociationsMessageExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'allMessageChannelMessageASsociations',
          viewFieldName: 'messageExternalId',
          fieldName: 'messageExternalId',
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageASsociationsDirection:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'allMessageChannelMessageASsociations',
          viewFieldName: 'direction',
          fieldName: 'direction',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageASsociationsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'allMessageChannelMessageASsociations',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 4,
          isVisible: true,
          size: 150,
        },
      }),

    messageChannelMessageASsociationRecordPageFieldsMessageChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          viewFieldName: 'messageChannelId',
          fieldName: 'messageChannelId',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageASsociationRecordPageFieldsMessage:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          viewFieldName: 'message',
          fieldName: 'message',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageASsociationRecordPageFieldsMessageExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          viewFieldName: 'messageExternalId',
          fieldName: 'messageExternalId',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageASsociationRecordPageFieldsDirection:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          viewFieldName: 'direction',
          fieldName: 'direction',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageASsociationRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    messageChannelMessageASsociationRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageASsociation',
        context: {
          viewName: 'messageChannelMessageASsociationRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
  };
};
