import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_STAFF_STATUS_HISTORY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktStaffStatusHistoryAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktStaffStatusHistory,
  );

  if (!itemObjectMetadata) {
    throw new Error('Staff Status History object metadata not found');
  }

  return {
    name: 'All Staff Status Changes',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 18,
    icon: 'IconHistory',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_STAFF_STATUS_HISTORY_FIELD_IDS.staffId,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.fromStatusId,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.toStatusId,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.changeDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 140,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.changeReason,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.approvedBy,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 140,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.expectedEndDate,
          )?.id ?? '',
        position: 6,
        isVisible: false,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              MKT_STAFF_STATUS_HISTORY_FIELD_IDS.actualEndDate,
          )?.id ?? '',
        position: 7,
        isVisible: false,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_STAFF_STATUS_HISTORY_FIELD_IDS.notes,
          )?.id ?? '',
        position: 8,
        isVisible: false,
        size: 250,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 9,
        isVisible: false,
        size: 150,
      },
    ],
  };
};
