import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

import {
  CARRIER_STANDARD_FIELD_IDS
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const carriersAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
): ViewDefinition => {
  return {
    name: 'All Carriers',
    objectMetadataId:
      objectMetadataItems.find(
        (item) => item.standardId === STANDARD_OBJECT_IDS.carrier,
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
            (item) => item.standardId === STANDARD_OBJECT_IDS.carrier,
          )?.fields.find(
            (field) => field.standardId === CARRIER_STANDARD_FIELD_IDS.name,
          )?.id || '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.carrier,
          )?.fields.find(
            (field) => field.standardId === CARRIER_STANDARD_FIELD_IDS.domainName,
          )?.id || '',
        position: 1,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.carrier,
          )?.fields.find(
            (field) => field.standardId === CARRIER_STANDARD_FIELD_IDS.location,
          )?.id || '',
        position: 2,
        isVisible: true,
        size: 210,
      },
    ],
  };
};
