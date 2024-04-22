import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  baseObjectStandardFieldIds,
  companyStandardFieldIds,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewCompanyFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          companyStandardFieldIds.name
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          companyStandardFieldIds.domainName
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 100,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          companyStandardFieldIds.accountOwner
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          baseObjectStandardFieldIds.createdAt
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          companyStandardFieldIds.employees
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          companyStandardFieldIds.linkedinLink
        ],
      viewId: viewId,
      position: 5,
      isVisible: true,
      size: 170,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.company].fields[
          companyStandardFieldIds.address
        ],
      viewId: viewId,
      position: 6,
      isVisible: true,
      size: 170,
    },
  ];
};
