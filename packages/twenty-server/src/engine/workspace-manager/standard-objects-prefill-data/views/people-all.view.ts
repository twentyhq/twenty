import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const peopleAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.emails
          ],
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.countUniqueValues,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.createdBy
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.company
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.phones
          ],
        position: 4,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageEmpty,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
          ],
        position: 5,
        isVisible: true,
        size: 150,
        aggregateOperation: AGGREGATE_OPERATIONS.min,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.city
          ],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.jobTitle
          ],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.linkedinLink
          ],
        position: 8,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.person].fields[
            PERSON_STANDARD_FIELD_IDS.xLink
          ],
        position: 9,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
