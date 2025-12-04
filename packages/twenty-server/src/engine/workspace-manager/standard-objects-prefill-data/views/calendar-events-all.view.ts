import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CALENDAR_EVENT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const calendarEventsAllView = ({
  objectMetadataItems,
  twentyStandardFlatApplication,
  useCoreNaming,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const calendarEventObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.calendarEvent,
  );

  if (!calendarEventObjectMetadata) {
    throw new Error('CalendarEvent object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Calendar Events',
    objectMetadataId: calendarEventObjectMetadata.id ?? '',
    type: 'calendar',
    key: 'INDEX',
    position: 0,
    icon: 'IconCalendar',
    calendarFieldMetadataId:
      calendarEventObjectMetadata.fields.find(
        (field) =>
          field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
      )?.id ?? '',
    calendarLayout: 'MONTH',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .title.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .startsAt.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.endsAt,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .endsAt.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.isFullDay,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 100,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .isFullDay.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.location,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .location.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceLink,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .conferenceLink.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === CALENDAR_EVENT_STANDARD_FIELD_IDS.isCanceled,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 100,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .isCanceled.universalIdentifier,
      },
      {
        fieldMetadataId:
          calendarEventObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.views.allCalendarEvents.viewFields
            .createdAt.universalIdentifier,
      },
    ],
  };
};
