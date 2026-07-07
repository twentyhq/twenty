import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageCampaignViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageCampaign'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageCampaignsSubject: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'subject',
        fieldName: 'subject',
        position: 0,
        isVisible: true,
        size: 300,
      },
    }),
    allMessageCampaignsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 120,
      },
    }),
    allMessageCampaignsList: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'list',
        fieldName: 'list',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageCampaignsFromAddress: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'fromAddress',
        fieldName: 'fromAddress',
        position: 3,
        isVisible: true,
        size: 200,
      },
    }),
    allMessageCampaignsSentAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'sentAt',
        fieldName: 'sentAt',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageCampaignsSentCount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'sentCount',
        fieldName: 'sentCount',
        position: 5,
        isVisible: true,
        size: 100,
      },
    }),
    allMessageCampaignsFailedCount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'failedCount',
        fieldName: 'failedCount',
        position: 6,
        isVisible: true,
        size: 100,
      },
    }),
    allMessageCampaignsBouncedCount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'bouncedCount',
        fieldName: 'bouncedCount',
        position: 7,
        isVisible: true,
        size: 100,
      },
    }),
    allMessageCampaignsComplainedCount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'complainedCount',
        fieldName: 'complainedCount',
        position: 8,
        isVisible: true,
        size: 120,
      },
    }),
    allMessageCampaignsRecipients: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'recipients',
        fieldName: 'recipients',
        position: 9,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageCampaignsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 10,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
