import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const seedCompaniesAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.domainName
          ],
        position: 1,
        isVisible: true,
        size: 100,
        aggregateOperation: AGGREGATE_OPERATIONS.count,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.createdBy
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.accountOwner
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
          ],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.employees
          ],
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.max,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.linkedinLink
          ],
        position: 6,
        isVisible: true,
        size: 170,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageEmpty,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.address
          ],
        position: 7,
        isVisible: true,
        size: 170,
        aggregateOperation: AGGREGATE_OPERATIONS.countNotEmpty,
      },
    ],
  };
};
