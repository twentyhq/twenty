import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { POLICY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const policiesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  return {
    name: 'All Policies',
    objectMetadataId:
      objectMetadataItems.find(
        (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
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
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.policyNumber,
          )?.id || '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.status,
          )?.id || '',
        position: 1,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.effectiveDate,
          )?.id || '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.expirationDate,
          )?.id || '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.carrier,
          )?.id || '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.premium,
          )?.id || '',
        position: 5,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.lineOfBusiness,
          )?.id || '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.paymentStatus,
          )?.id || '',
        position: 7,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.autoRenew,
          )?.id || '',
        position: 8,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          objectMetadataItems.find(
            (item) => item.standardId === STANDARD_OBJECT_IDS.policy,
          )?.fields.find(
            (field) => field.standardId === POLICY_STANDARD_FIELD_IDS.agent,
          )?.id || '',
        position: 9,
        isVisible: true,
        size: 150,
      },
    ],
  };
};