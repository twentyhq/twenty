import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageChannelMessageAssociationViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'messageChannelMessageAssociation'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allMessageChannelMessageAssociationsMessageChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'allMessageChannelMessageAssociations',
          viewFieldName: 'messageChannelId',
          fieldName: 'messageChannelId',
          position: 0,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageAssociationsMessage:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'allMessageChannelMessageAssociations',
          viewFieldName: 'message',
          fieldName: 'message',
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageAssociationsMessageExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'allMessageChannelMessageAssociations',
          viewFieldName: 'messageExternalId',
          fieldName: 'messageExternalId',
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageAssociationsDirection:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'allMessageChannelMessageAssociations',
          viewFieldName: 'direction',
          fieldName: 'direction',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),
    allMessageChannelMessageAssociationsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'allMessageChannelMessageAssociations',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 4,
          isVisible: true,
          size: 150,
        },
      }),

    messageChannelMessageAssociationRecordPageFieldsMessageChannel:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldName: 'messageChannelId',
          fieldName: 'messageChannelId',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageAssociationRecordPageFieldsMessage:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldName: 'message',
          fieldName: 'message',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageAssociationRecordPageFieldsMessageExternalId:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldName: 'messageExternalId',
          fieldName: 'messageExternalId',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageAssociationRecordPageFieldsDirection:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldName: 'direction',
          fieldName: 'direction',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelMessageAssociationRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'system',
        },
      }),
    messageChannelMessageAssociationRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannelMessageAssociation',
        context: {
          viewName: 'messageChannelMessageAssociationRecordPageFields',
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
