import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewPersonFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.name
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 210,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.email
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.company
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.phone
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.city
        ],
      viewId: viewId,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.jobTitle
        ],
      viewId: viewId,
      position: 6,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.linkedinLink
        ],
      viewId: viewId,
      position: 7,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.person].fields[
          PERSON_STANDARD_FIELD_IDS.xLink
        ],
      viewId: viewId,
      position: 8,
      isVisible: true,
      size: 150,
    },
  ];
};
