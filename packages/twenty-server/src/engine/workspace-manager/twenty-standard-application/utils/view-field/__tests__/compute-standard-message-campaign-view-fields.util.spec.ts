import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { computeStandardMessageCampaignViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-message-campaign-view-fields.util';

const MESSAGE_CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const buildArgs = () => {
  const byUniversalIdentifier = Object.fromEntries(
    Object.values(MESSAGE_CAMPAIGN.views).map((view) => [
      view.universalIdentifier,
      { isSystemSideEffect: false },
    ]),
  );

  return {
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    now: '2026-01-01T00:00:00.000Z',
    objectName: 'messageCampaign' as const,
    standardObjectMetadataRelatedEntityIds:
      getStandardObjectMetadataRelatedEntityIds(),
    dependencyFlatEntityMaps: {
      flatViewMaps: { byUniversalIdentifier },
    },
  };
};

const collectViewFieldNames = (
  viewName: keyof typeof MESSAGE_CAMPAIGN.views,
): string[] => {
  const view = MESSAGE_CAMPAIGN.views[viewName];
  const nameByUniversalIdentifier = new Map(
    Object.entries(view.viewFields).map(([fieldName, viewField]) => [
      viewField.universalIdentifier,
      fieldName,
    ]),
  );

  return Object.values(computeStandardMessageCampaignViewFields(buildArgs()))
    .filter(
      (viewField) =>
        viewField.viewUniversalIdentifier === view.universalIdentifier,
    )
    .sort((a, b) => a.position - b.position)
    .map(
      (viewField) =>
        nameByUniversalIdentifier.get(viewField.universalIdentifier) ??
        viewField.universalIdentifier,
    );
};

describe('computeStandardMessageCampaignViewFields', () => {
  it('builds every field the index view declares, in the declared order', () => {
    expect(collectViewFieldNames('allMessageCampaigns')).toEqual(
      Object.keys(MESSAGE_CAMPAIGN.views.allMessageCampaigns.viewFields),
    );
  });

  it('builds every field the record page declares, in the declared order', () => {
    expect(collectViewFieldNames('messageCampaignRecordPageFields')).toEqual(
      Object.keys(
        MESSAGE_CAMPAIGN.views.messageCampaignRecordPageFields.viewFields,
      ),
    );
  });
});
