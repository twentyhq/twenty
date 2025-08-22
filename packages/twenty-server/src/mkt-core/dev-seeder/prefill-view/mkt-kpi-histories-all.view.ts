import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MKT_KPI_HISTORY_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const mktKpiHistoriesAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const itemObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === MKT_OBJECT_IDS.mktKpiHistory,
  );

  if (!itemObjectMetadata) {
    throw new Error('KPI History object metadata not found');
  }

  return [
    {
      name: 'All KPI Histories',
      objectMetadataId: itemObjectMetadata.id ?? '',
      type: 'table',
      key: 'INDEX',
      position: 20,
      icon: 'IconHistory',
      kanbanFieldMetadataId: '',
      openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
      filters: [],
      fields: [
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) => field.standardId === MKT_KPI_HISTORY_FIELD_IDS.kpi,
            )?.id ?? '',
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeType,
            )?.id ?? '',
          position: 1,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeTimestamp,
            )?.id ?? '',
          position: 2,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeReason,
            )?.id ?? '',
          position: 3,
          isVisible: true,
          size: 200,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeSource,
            )?.id ?? '',
          position: 4,
          isVisible: true,
          size: 120,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.oldValue,
            )?.id ?? '',
          position: 5,
          isVisible: false,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.newValue,
            )?.id ?? '',
          position: 6,
          isVisible: false,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId ===
                MKT_KPI_HISTORY_FIELD_IDS.changeDescription,
            )?.id ?? '',
          position: 7,
          isVisible: false,
          size: 250,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
            )?.id ?? '',
          position: 8,
          isVisible: false,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
            )?.id ?? '',
          position: 9,
          isVisible: false,
          size: 150,
        },
      ],
      sorts: [
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeTimestamp,
            )?.id ?? '',
          direction: 'desc',
        },
      ],
    },
    {
      name: 'Recent Changes',
      objectMetadataId: itemObjectMetadata.id ?? '',
      type: 'table',
      key: 'RECENT',
      position: 21,
      icon: 'IconClock',
      kanbanFieldMetadataId: '',
      openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
      filters: [
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeTimestamp,
            )?.id ?? '',
          operand: 'gte',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          displayValue: 'Last 7 days',
        },
      ],
      fields: [
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) => field.standardId === MKT_KPI_HISTORY_FIELD_IDS.kpi,
            )?.id ?? '',
          position: 0,
          isVisible: true,
          size: 180,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeType,
            )?.id ?? '',
          position: 1,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeTimestamp,
            )?.id ?? '',
          position: 2,
          isVisible: true,
          size: 150,
        },
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeReason,
            )?.id ?? '',
          position: 3,
          isVisible: true,
          size: 200,
        },
      ],
      sorts: [
        {
          fieldMetadataId:
            itemObjectMetadata.fields.find(
              (field) =>
                field.standardId === MKT_KPI_HISTORY_FIELD_IDS.changeTimestamp,
            )?.id ?? '',
          direction: 'desc',
        },
      ],
    },
  ];
};
