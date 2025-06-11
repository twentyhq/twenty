import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

import {
  MGA_STANDARD_FIELD_IDS
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const mgasAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
): ViewDefinition => {
  return {
    name: 'All MGAs',
    objectMetadataId:
      objectMetadataItems.find(
        (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
      )?.id || '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
          )?.fields.find(
            (field) => field.standardId === MGA_STANDARD_FIELD_IDS.name,
          )?.id || '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
          )?.fields.find(
            (field) => field.standardId === MGA_STANDARD_FIELD_IDS.naic,
          )?.id || '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
          )?.fields.find(
            (field) => field.standardId === MGA_STANDARD_FIELD_IDS.email,
          )?.id || '',
        position: 2,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
          )?.fields.find(
            (field) => field.standardId === MGA_STANDARD_FIELD_IDS.phone,
          )?.id || '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
          )?.fields.find(
            (field) => field.standardId === MGA_STANDARD_FIELD_IDS.isActive,
          )?.id || '',
        position: 4,
        isVisible: true,
        size: 100,
      },
    ],
    viewSorts: [
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.mga,
          )?.fields.find(
            (field) => field.standardId === MGA_STANDARD_FIELD_IDS.name,
          )?.id || '',
        direction: 'asc',
      },
    ],
  };
}; 