import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewCompanyFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          COMPANY_STANDARD_FIELD_IDS.name
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          COMPANY_STANDARD_FIELD_IDS.domainName
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 100,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          COMPANY_STANDARD_FIELD_IDS.accountOwner
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          COMPANY_STANDARD_FIELD_IDS.employees
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          COMPANY_STANDARD_FIELD_IDS.linkedinLink
        ],
      viewId: viewId,
      position: 5,
      isVisible: true,
      size: 170,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
          COMPANY_STANDARD_FIELD_IDS.address
        ],
      viewId: viewId,
      position: 6,
      isVisible: true,
      size: 170,
    },
  ];
};
