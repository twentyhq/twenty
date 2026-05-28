import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageCampaignViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageCampaign'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allCampaignsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 240,
      },
    }),
    allCampaignsStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'status',
        fieldName: 'status',
        position: 1,
        isVisible: true,
        size: 120,
      },
    }),
    allCampaignsSubject: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'subject',
        fieldName: 'subject',
        position: 2,
        isVisible: true,
        size: 280,
      },
    }),
    allCampaignsSentCount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'sentCount',
        fieldName: 'sentCount',
        position: 3,
        isVisible: true,
        size: 100,
      },
    }),
    allCampaignsBouncedCount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'bouncedCount',
        fieldName: 'bouncedCount',
        position: 4,
        isVisible: true,
        size: 120,
      },
    }),
    allCampaignsSentAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'sentAt',
        fieldName: 'sentAt',
        position: 5,
        isVisible: true,
        size: 160,
      },
    }),
    allCampaignsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageCampaign',
      context: {
        viewName: 'allCampaigns',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
