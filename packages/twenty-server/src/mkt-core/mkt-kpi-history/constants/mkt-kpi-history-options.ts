import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum MKT_KPI_HISTORY_CHANGE_TYPE {
  TARGET_UPDATED = 'TARGET_UPDATED',
  ACTUAL_UPDATED = 'ACTUAL_UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNED = 'ASSIGNED',
  CONFIGURATION_CHANGED = 'CONFIGURATION_CHANGED',
}

export const MKT_KPI_HISTORY_CHANGE_TYPE_OPTIONS: FieldMetadataComplexOption[] =
  [
    {
      value: MKT_KPI_HISTORY_CHANGE_TYPE.TARGET_UPDATED,
      label: 'Target Updated',
      color: 'blue',
      position: 0,
    },
    {
      value: MKT_KPI_HISTORY_CHANGE_TYPE.ACTUAL_UPDATED,
      label: 'Actual Updated',
      color: 'green',
      position: 1,
    },
    {
      value: MKT_KPI_HISTORY_CHANGE_TYPE.STATUS_CHANGED,
      label: 'Status Changed',
      color: 'orange',
      position: 2,
    },
    {
      value: MKT_KPI_HISTORY_CHANGE_TYPE.ASSIGNED,
      label: 'Assigned',
      color: 'purple',
      position: 3,
    },
    {
      value: MKT_KPI_HISTORY_CHANGE_TYPE.CONFIGURATION_CHANGED,
      label: 'Configuration Changed',
      color: 'yellow',
      position: 4,
    },
  ];

export const MKT_KPI_HISTORY_CHANGE_SOURCE_OPTIONS: FieldMetadataComplexOption[] =
  [
    {
      value: 'MANUAL',
      label: 'Manual',
      color: 'blue',
      position: 0,
    },
    {
      value: 'AUTOMATIC',
      label: 'Automatic',
      color: 'green',
      position: 1,
    },
    {
      value: 'API',
      label: 'API',
      color: 'orange',
      position: 2,
    },
    {
      value: 'BULK_UPDATE',
      label: 'Bulk Update',
      color: 'purple',
      position: 3,
    },
  ];
