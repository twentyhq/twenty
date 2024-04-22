import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { opportunityStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewOpportunityFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.opportunity].fields[
          opportunityStandardFieldIds.name
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.opportunity].fields[
          opportunityStandardFieldIds.amount
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.opportunity].fields[
          opportunityStandardFieldIds.closeDate
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.opportunity].fields[
          opportunityStandardFieldIds.probability
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.opportunity].fields[
          opportunityStandardFieldIds.pointOfContact
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
  ];
};
