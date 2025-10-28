import { msg } from '@lingui/core/macro';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  DASHBOARD_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const dashboardsAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
  useCoreNaming = false,
) => {
  const dashboardObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.dashboard,
  );

  if (!dashboardObjectMetadata) {
    throw new Error('Dashboard object metadata not found');
  }

  return {
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Dashboards',
    objectMetadataId: dashboardObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconLayoutDashboard',
    kanbanFieldMetadataId: '',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          dashboardObjectMetadata.fields.find(
            (field) => field.standardId === DASHBOARD_STANDARD_FIELD_IDS.title,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          dashboardObjectMetadata.fields.find(
            (field) =>
              field.standardId === DASHBOARD_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          dashboardObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          dashboardObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
