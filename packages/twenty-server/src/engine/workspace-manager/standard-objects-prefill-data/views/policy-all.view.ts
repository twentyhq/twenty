import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';
import { POLICY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const policyAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All Policies',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.policyNumber
          ],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.status
          ],
        position: 1,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.effectiveDate
          ],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.expirationDate
          ],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.carrier
          ],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.premium
          ],
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.lineOfBusiness
          ],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.paymentStatus
          ],
        position: 7,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.autoRenew
          ],
        position: 8,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.policy].fields[
            POLICY_STANDARD_FIELD_IDS.agent
          ],
        position: 9,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
