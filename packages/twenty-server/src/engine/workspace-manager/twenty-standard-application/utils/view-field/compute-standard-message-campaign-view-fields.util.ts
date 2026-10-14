import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageCampaignViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageCampaign'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageCampaignsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 250,
      },
    }),
    allMessageCampaignsSubject: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'subject',
        fieldName: 'subject',
        position: 1,
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
        position: 2,
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
        position: 3,
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
        position: 4,
        isVisible: true,
        size: 200,
      },
    }),
    allMessageCampaignsScheduledAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'scheduledAt',
        fieldName: 'scheduledAt',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageCampaignsSentAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'sentAt',
        fieldName: 'sentAt',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageCampaignsRecipients: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allMessageCampaigns',
        viewFieldName: 'recipients',
        fieldName: 'recipients',
        position: 13,
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
        position: 14,
        isVisible: true,
        size: 150,
      },
    }),

    messageCampaignListName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 250,
      },
    }),
    messageCampaignListSubject: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'subject',
        fieldName: 'subject',
        position: 1,
        isVisible: true,
        size: 300,
      },
    }),
    messageCampaignListStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 2,
        isVisible: true,
        size: 120,
      },
    }),
    messageCampaignListList: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'list',
        fieldName: 'list',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    messageCampaignListFromAddress: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'fromAddress',
        fieldName: 'fromAddress',
        position: 4,
        isVisible: true,
        size: 200,
      },
    }),
    messageCampaignListScheduledAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'scheduledAt',
        fieldName: 'scheduledAt',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    messageCampaignListSentAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'sentAt',
        fieldName: 'sentAt',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    messageCampaignListRecipients: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'recipients',
        fieldName: 'recipients',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    messageCampaignListCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignList',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 8,
        isVisible: true,
        size: 150,
      },
    }),

    messageCampaignRecordPageFieldsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignRecordPageFields',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 0,
        isVisible: true,
        size: 120,
        viewFieldGroupName: 'stats',
      },
    }),
    messageCampaignRecordPageFieldsScheduledAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'scheduledAt',
          fieldName: 'scheduledAt',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsSentAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'messageCampaignRecordPageFields',
        viewFieldName: 'sentAt',
        fieldName: 'sentAt',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'stats',
      },
    }),
    messageCampaignRecordPageFieldsSentCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'sentCount',
          fieldName: 'sentCount',
          position: 3,
          isVisible: true,
          size: 100,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsDeliveredCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'deliveredCount',
          fieldName: 'deliveredCount',
          position: 4,
          isVisible: true,
          size: 100,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsFailedCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'failedCount',
          fieldName: 'failedCount',
          position: 5,
          isVisible: true,
          size: 100,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsSkippedCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'skippedCount',
          fieldName: 'skippedCount',
          position: 6,
          isVisible: true,
          size: 100,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsBouncedCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'bouncedCount',
          fieldName: 'bouncedCount',
          position: 7,
          isVisible: true,
          size: 100,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsComplainedCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'complainedCount',
          fieldName: 'complainedCount',
          position: 8,
          isVisible: true,
          size: 120,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsUniqueClickCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'uniqueClickCount',
          fieldName: 'uniqueClickCount',
          position: 9,
          isVisible: true,
          size: 120,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsClickRate:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'clickRate',
          fieldName: 'clickRate',
          position: 10,
          isVisible: true,
          size: 120,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsUniqueOpenCount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'uniqueOpenCount',
          fieldName: 'uniqueOpenCount',
          position: 11,
          isVisible: true,
          size: 120,
          viewFieldGroupName: 'stats',
        },
      }),
    messageCampaignRecordPageFieldsOpenRate:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageCampaign',
        context: {
          viewName: 'messageCampaignRecordPageFields',
          viewFieldName: 'openRate',
          fieldName: 'openRate',
          position: 12,
          isVisible: true,
          size: 120,
          viewFieldGroupName: 'stats',
        },
      }),
  };
};
