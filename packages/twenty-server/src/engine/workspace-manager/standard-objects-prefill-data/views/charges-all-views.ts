import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { CHARGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const chargesAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const chargeObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.charge,
  );

  if (!chargeObjectMetadata) {
    throw new Error('Charge object metadata not found');
  }

  return {
    name: 'All charges',
    objectMetadataId: chargeObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.product,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.quantity,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.taxId,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) =>
              field.standardId === CHARGE_STANDARD_FIELD_IDS.entityType,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.price,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.discount,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) =>
              field.standardId === CHARGE_STANDARD_FIELD_IDS.recurrence,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.company,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) =>
              field.standardId === CHARGE_STANDARD_FIELD_IDS.chargeAction,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) => field.standardId === CHARGE_STANDARD_FIELD_IDS.person,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          chargeObjectMetadata.fields.find(
            (field) =>
              field.standardId === CHARGE_STANDARD_FIELD_IDS.integration,
          )?.id ?? '',
        position: 9,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
