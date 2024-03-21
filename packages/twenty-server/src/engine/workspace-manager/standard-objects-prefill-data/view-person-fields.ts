import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  baseObjectStandardFieldIds,
  personStandardFieldIds,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const viewPersonFields = (
  viewId: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return [
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.name
        ],
      viewId: viewId,
      position: 0,
      isVisible: true,
      size: 210,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.email
        ],
      viewId: viewId,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.company
        ],
      viewId: viewId,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.phone
        ],
      viewId: viewId,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          baseObjectStandardFieldIds.createdAt
        ],
      viewId: viewId,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.city
        ],
      viewId: viewId,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.jobTitle
        ],
      viewId: viewId,
      position: 6,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.linkedinLink
        ],
      viewId: viewId,
      position: 7,
      isVisible: true,
      size: 150,
    },
    {
      fieldMetadataId:
        objectMetadataMap[standardObjectIds.person].fields[
          personStandardFieldIds.xLink
        ],
      viewId: viewId,
      position: 8,
      isVisible: true,
      size: 150,
    },
  ];
};
