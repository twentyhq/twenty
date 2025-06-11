import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

import {
    MGA_STANDARD_FIELD_IDS
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const mgasAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
): ViewDefinition => {
  return {
    name: 'All MGAs',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].fields[
            MGA_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].fields[
            MGA_STANDARD_FIELD_IDS.naic
          ],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].fields[
            MGA_STANDARD_FIELD_IDS.email
          ],
        position: 2,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].fields[
            MGA_STANDARD_FIELD_IDS.phone
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].fields[
            MGA_STANDARD_FIELD_IDS.isActive
          ],
        position: 4,
        isVisible: true,
        size: 100,
      },
    ],
    viewSorts: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.mga].fields[
            MGA_STANDARD_FIELD_IDS.name
          ],
        direction: 'asc',
      },
    ],
  };
}; 