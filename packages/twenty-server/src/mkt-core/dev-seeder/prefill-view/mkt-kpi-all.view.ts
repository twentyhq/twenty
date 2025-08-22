import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_KPI_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktKpisAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktKpi,
  );

  if (!itemObjectMetadata) {
    throw new Error('KPI object metadata not found');
  }

  return {
    name: 'All KPIs',
    objectMetadataId: itemObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 17,
    icon: 'IconTarget',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.kpiName,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.kpiCode,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.kpiType,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.kpiCategory,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.targetValue,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.actualValue,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.unitOfMeasure,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.periodType,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.periodYear,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.periodMonth,
          )?.id ?? '',
        position: 9,
        isVisible: true,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.status,
          )?.id ?? '',
        position: 10,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.assigneeType,
          )?.id ?? '',
        position: 11,
        isVisible: true,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.priority,
          )?.id ?? '',
        position: 12,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.weight,
          )?.id ?? '',
        position: 13,
        isVisible: false,
        size: 80,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.isAutoCalculated,
          )?.id ?? '',
        position: 14,
        isVisible: false,
        size: 100,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.description,
          )?.id ?? '',
        position: 15,
        isVisible: false,
        size: 200,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.periodStartDate,
          )?.id ?? '',
        position: 16,
        isVisible: false,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.periodEndDate,
          )?.id ?? '',
        position: 17,
        isVisible: false,
        size: 120,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) => field.standardId === MKT_KPI_FIELD_IDS.achievedAt,
          )?.id ?? '',
        position: 18,
        isVisible: false,
        size: 150,
      },
      {
        fieldMetadataId:
          itemObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 19,
        isVisible: false,
        size: 150,
      },
    ],
  };
};
