import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewOpportunityFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
          OPPORTUNITY_STANDARD_FIELD_IDS.name
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
          OPPORTUNITY_STANDARD_FIELD_IDS.amount
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
          OPPORTUNITY_STANDARD_FIELD_IDS.closeDate
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
          OPPORTUNITY_STANDARD_FIELD_IDS.company
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
          OPPORTUNITY_STANDARD_FIELD_IDS.probability
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
          OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact
        ],
      viewId: viewId,
      position: 5,
      isVisible: true,
      size: 150,
    },
  ];
};
