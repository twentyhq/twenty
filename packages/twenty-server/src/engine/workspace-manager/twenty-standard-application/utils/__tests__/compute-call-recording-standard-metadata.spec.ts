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

describe('CallRecording standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it('builds the callRecording and association objects', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatObjectMetadataMaps;

    expect(
      byUniversalIdentifier[STANDARD_OBJECTS.callRecording.universalIdentifier],
    ).toBeDefined();
    expect(
      byUniversalIdentifier[
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation
          .universalIdentifier
      ],
    ).toBeDefined();
  });

  it('marks the callRecording object as system', () => {
    const callRecording =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.universalIdentifier
      ];

    expect(callRecording?.isSystem).toBe(true);
  });

  it('enforces a unique index on meetingOccurrenceKey', () => {
    const meetingOccurrenceKeyIndex =
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.indexes.meetingOccurrenceKeyIndex
          .universalIdentifier
      ];

    expect(meetingOccurrenceKeyIndex).toBeDefined();
    expect(meetingOccurrenceKeyIndex?.isUnique).toBe(true);
  });

  it('keeps the callRecording table view focused on recording identifiers and status', () => {
    const viewFieldFieldUniversalIdentifiers = Object.values(
      allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewField) =>
          viewField.viewUniversalIdentifier ===
          STANDARD_OBJECTS.callRecording.views.allCallRecordings
            .universalIdentifier,
      )
      .map((viewField) => viewField.fieldMetadataUniversalIdentifier);

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(3);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.callRecording.fields.meetingOccurrenceKey
          .universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.startedAt.universalIdentifier,
      ]),
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.callRecording.fields.createdAt.universalIdentifier,
    );
  });

  it('uses the important callRecording detail fields on the record page', () => {
    const viewFieldFieldUniversalIdentifiers = Object.values(
      allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewField) =>
          viewField.viewUniversalIdentifier ===
          STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
            .universalIdentifier,
      )
      .map((viewField) => viewField.fieldMetadataUniversalIdentifier);

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(8);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.callRecording.fields.meetingOccurrenceKey
          .universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.startedAt.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.endedAt.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.video.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.audio.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.transcript.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.failureReason.universalIdentifier,
      ]),
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.callRecording.fields.createdAt.universalIdentifier,
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.callRecording.fields.createdBy.universalIdentifier,
    );
  });

  it('keeps the association table view focused on its label identifier and linked records', () => {
    const viewFieldFieldUniversalIdentifiers = Object.values(
      allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewField) =>
          viewField.viewUniversalIdentifier ===
          STANDARD_OBJECTS.callRecordingCalendarEventAssociation.views
            .allCallRecordingCalendarEventAssociations.universalIdentifier,
      )
      .map((viewField) => viewField.fieldMetadataUniversalIdentifier);

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(4);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation.fields.id
          .universalIdentifier,
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation.fields
          .callRecording.universalIdentifier,
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation.fields
          .calendarEvent.universalIdentifier,
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation.fields
          .eventExternalId.universalIdentifier,
      ]),
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.callRecordingCalendarEventAssociation.fields.createdAt
        .universalIdentifier,
    );
  });

  it('links the callRecording fields widget to its record-page fields view', () => {
    const fieldsWidget =
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
          .home.widgets.fields.universalIdentifier
      ];

    expect(fieldsWidget?.universalConfiguration).toMatchObject({
      configurationType: WidgetConfigurationType.FIELDS,
      viewUniversalIdentifier:
        STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
          .universalIdentifier,
    });
  });
});
