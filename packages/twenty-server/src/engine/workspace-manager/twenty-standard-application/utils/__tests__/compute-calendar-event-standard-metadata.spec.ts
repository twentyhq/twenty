import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('CalendarEvent standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it('builds the calendarEvent object', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatObjectMetadataMaps;

    expect(
      byUniversalIdentifier[STANDARD_OBJECTS.calendarEvent.universalIdentifier],
    ).toBeDefined();
  });

  it('uses the important calendar event detail fields on the record page', () => {
    const recordPageViewFields = Object.values(
      allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewField) =>
          viewField.viewUniversalIdentifier ===
          STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
            .universalIdentifier,
      );

    const viewFieldFieldUniversalIdentifiers = recordPageViewFields.map(
      (viewField) => viewField.fieldMetadataUniversalIdentifier,
    );

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(12);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.calendarEvent.fields.title.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.startsAt.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.endsAt.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.isFullDay.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.isCanceled.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.conferenceLink
          .universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.location.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.description.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.externalCreatedAt
          .universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.externalUpdatedAt
          .universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.iCalUid.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.conferenceSolution
          .universalIdentifier,
      ]),
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.calendarEvent.fields.createdAt.universalIdentifier,
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.calendarEvent.fields.calendarEventParticipants
        .universalIdentifier,
    );

    expect(
      recordPageViewFields
        .filter((viewField) => viewField.isVisible)
        .sort((firstViewField, secondViewField) => {
          return firstViewField.position - secondViewField.position;
        })
        .map((viewField) => viewField.fieldMetadataUniversalIdentifier),
    ).toEqual([
      STANDARD_OBJECTS.calendarEvent.fields.startsAt.universalIdentifier,
      STANDARD_OBJECTS.calendarEvent.fields.endsAt.universalIdentifier,
      STANDARD_OBJECTS.calendarEvent.fields.conferenceLink.universalIdentifier,
      STANDARD_OBJECTS.calendarEvent.fields.location.universalIdentifier,
      STANDARD_OBJECTS.calendarEvent.fields.description.universalIdentifier,
    ]);

    expect(
      recordPageViewFields
        .filter((viewField) => !viewField.isVisible)
        .map((viewField) => viewField.fieldMetadataUniversalIdentifier),
    ).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.calendarEvent.fields.title.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.isFullDay.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.isCanceled.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.externalCreatedAt
          .universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.externalUpdatedAt
          .universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.iCalUid.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.fields.conferenceSolution
          .universalIdentifier,
      ]),
    );
  });

  it('groups the record page fields into general and system sections', () => {
    const generalGroup =
      allFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
          .viewFieldGroups.general.universalIdentifier
      ];
    const systemGroup =
      allFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
          .viewFieldGroups.system.universalIdentifier
      ];

    expect(generalGroup).toBeDefined();
    expect(systemGroup).toBeDefined();
  });

  it('links the calendar event fields widget to its record-page fields view', () => {
    const fieldsWidget =
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
          .home.widgets.fields.universalIdentifier
      ];

    expect(fieldsWidget?.universalConfiguration).toMatchObject({
      configurationType: WidgetConfigurationType.FIELDS,
      viewUniversalIdentifier:
        STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
          .universalIdentifier,
    });
  });

  it('configures participants as a standard relation field widget', () => {
    const participantsWidget =
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
          .home.widgets.participants.universalIdentifier
      ];

    expect(participantsWidget?.universalConfiguration).toMatchObject({
      configurationType: WidgetConfigurationType.FIELD,
      fieldMetadataId:
        STANDARD_OBJECTS.calendarEvent.fields.calendarEventParticipants
          .universalIdentifier,
    });
  });

  it('configures a timeline tab on the calendar event record page', () => {
    const timelineWidget =
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
          .timeline.widgets.timeline.universalIdentifier
      ];

    expect(
      Object.keys(
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs,
      ),
    ).toEqual(['home', 'timeline']);

    expect(timelineWidget?.universalConfiguration).toMatchObject({
      configurationType: WidgetConfigurationType.TIMELINE,
    });
  });

  it('renders call recordings through a standard relation field widget', () => {
    const callRecordingsWidget =
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
          .home.widgets.callRecordings.universalIdentifier
      ];

    expect(callRecordingsWidget?.universalConfiguration).toMatchObject({
      configurationType: WidgetConfigurationType.FIELD,
      fieldMetadataId:
        STANDARD_OBJECTS.calendarEvent.fields.callRecordings
          .universalIdentifier,
    });
  });
});
