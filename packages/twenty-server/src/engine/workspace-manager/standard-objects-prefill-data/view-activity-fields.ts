import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ACTIVITY_STANDARD_FIELD_IDS,
  BASE_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewActivityFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.activity].fields[
          ACTIVITY_STANDARD_FIELD_IDS.title
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 210,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.activity].fields[
          ACTIVITY_STANDARD_FIELD_IDS.type
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.activity].fields[
          ACTIVITY_STANDARD_FIELD_IDS.body
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.activity].fields[
          BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 150,
    },
    /*
    TODO: Add later, since we don't have real-time it probably doesn't work well?
    {
      fieldMetadataId:
        objectMetadataMap[STANDARD_OBJECT_IDS.activity].fields[
          BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 210,
    },
    */
  ];
};
