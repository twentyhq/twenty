import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_RESELLER_TIER_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktResellerTiersAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const resellerTierObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktResellerTier,
  );

  if (!resellerTierObjectMetadata) {
    throw new Error('Reseller Tier object metadata not found');
  }

  return {
    name: 'All Reseller Tiers',
    objectMetadataId: resellerTierObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 1,
    icon: 'IconStar',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_RESELLER_TIER_FIELD_IDS.tierCode,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_RESELLER_TIER_FIELD_IDS.tierName,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_RESELLER_TIER_FIELD_IDS.minCommitmentAmount,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MIN,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_RESELLER_TIER_FIELD_IDS.maxCommitmentAmount,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MAX,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_RESELLER_TIER_FIELD_IDS.commissionRate,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 120,
        aggregateOperation: AggregateOperations.AVG,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_RESELLER_TIER_FIELD_IDS.displayOrder,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_RESELLER_TIER_FIELD_IDS.isActive,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          resellerTierObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
