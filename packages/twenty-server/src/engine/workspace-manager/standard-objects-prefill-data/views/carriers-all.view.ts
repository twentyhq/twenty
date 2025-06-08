import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

import {
  CARRIER_STANDARD_FIELD_IDS
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const carriersAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
): ViewDefinition => {
  return {
    name: 'All Carriers',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.carrier].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.carrier].fields[
            CARRIER_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.carrier].fields[
            CARRIER_STANDARD_FIELD_IDS.domainName
          ],
        position: 1,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.carrier].fields[
            CARRIER_STANDARD_FIELD_IDS.location
          ],
        position: 2,
        isVisible: true,
        size: 210,
      },
    ],
    viewSorts: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.carrier].fields[
            CARRIER_STANDARD_FIELD_IDS.name
          ],
        direction: 'asc',
      },
    ],
  };
};
