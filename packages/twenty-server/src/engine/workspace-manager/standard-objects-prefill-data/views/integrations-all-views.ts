import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { INTEGRATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
export const integrationsAllView = (
    objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
  ) => {
  return {
    name: 'All',
    objectMetadataId: objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.integration].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.integration].fields[
            INTEGRATION_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.integration].fields[
            INTEGRATION_STANDARD_FIELD_IDS.charge
          ],
        position: 1,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
