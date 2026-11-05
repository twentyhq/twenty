import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { computeStandardMessageCampaignViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-campaign-views.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { computeStandardMessageCampaignViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-message-campaign-view-fields.util';

const MESSAGE_CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const buildArgs = () => {
  const baseArgs = {
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'application-id',
    now: '2026-01-01T00:00:00.000Z',
    objectName: 'messageCampaign' as const,
    standardObjectMetadataRelatedEntityIds:
      getStandardObjectMetadataRelatedEntityIds(),
  };

  const flatViewMaps = Object.values(
    computeStandardMessageCampaignViews({
      ...baseArgs,
      dependencyFlatEntityMaps: {
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      },
    }),
  ).reduce<FlatEntityMaps<FlatView>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

  return {
    ...baseArgs,
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
      flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
      flatViewMaps,
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
