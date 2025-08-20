import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_STAFF_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktStaffsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktStaff,
  );

  if (!itemObjectMetadata) {
    throw new Error('Staff object metadata not found');
  }

  return {
    name: 'All Staff Members',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 17,
    icon: 'IconUser',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_STAFF_FIELD_IDS.employeeId,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_STAFF_FIELD_IDS.position,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_STAFF_FIELD_IDS.department,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_STAFF_FIELD_IDS.organizationLevel,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 140,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_STAFF_FIELD_IDS.employmentStatus,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 130,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_STAFF_FIELD_IDS.teamLeader,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 140,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_STAFF_FIELD_IDS.statusStartDate,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === MKT_STAFF_FIELD_IDS.statusExpectedEndDate,
          )?.id ?? '',
        position: 7,
        isVisible: false,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_STAFF_FIELD_IDS.hasKpiTracking,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 120,
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
