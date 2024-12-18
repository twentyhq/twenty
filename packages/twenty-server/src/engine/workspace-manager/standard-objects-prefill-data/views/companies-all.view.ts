import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const companiesAllView = (
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  return {
    name: 'All',
    objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.company].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.name
          ],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.domainName
          ],
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.createdBy
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.accountOwner
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            BASE_OBJECT_STANDARD_FIELD_IDS.createdAt
          ],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.employees
          ],
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.linkedinLink
          ],
        position: 6,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.company].fields[
            COMPANY_STANDARD_FIELD_IDS.address
          ],
        position: 7,
        isVisible: true,
        size: 170,
      },
    ],
  };
};
