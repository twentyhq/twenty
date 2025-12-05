import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { TIMELINE_ACTIVITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const timelineActivitiesAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const timelineActivityObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.timelineActivity,
  );

  if (!timelineActivityObjectMetadata) {
    throw new Error('TimelineActivity object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
      .universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming
      ? msg`All {objectLabelPlural}`
      : 'All Timeline Activities',
    objectMetadataId: timelineActivityObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    filters: [],
    fields: [
      {
        fieldMetadataId:
          timelineActivityObjectMetadata.fields.find(
            (field) =>
              field.standardId === TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.name.universalIdentifier,
      },
      {
        fieldMetadataId:
          timelineActivityObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.happensAt,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.happensAt.universalIdentifier,
      },
      {
        fieldMetadataId:
          timelineActivityObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.properties,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 200,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.properties.universalIdentifier,
      },
      {
        fieldMetadataId:
          timelineActivityObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workspaceMember,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.workspaceMember.universalIdentifier,
      },
      {
        fieldMetadataId:
          timelineActivityObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordCachedName,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 200,
        universalIdentifier:
          STANDARD_OBJECTS.timelineActivity.views.allTimelineActivities
            .viewFields.linkedRecordCachedName.universalIdentifier,
      },
    ],
  };
};
