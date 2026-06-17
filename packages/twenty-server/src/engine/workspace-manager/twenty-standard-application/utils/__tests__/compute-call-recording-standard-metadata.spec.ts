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

  it('builds the callRecording object', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatObjectMetadataMaps;

    expect(
      byUniversalIdentifier[STANDARD_OBJECTS.callRecording.universalIdentifier],
    ).toBeDefined();
  });

  it('marks the callRecording object as system', () => {
    const callRecording =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.universalIdentifier
      ];

    expect(callRecording?.isSystem).toBe(true);
  });

  it('links callRecording to a calendarEvent through a direct relation', () => {
    const calendarEventField =
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.fields.calendarEvent.universalIdentifier
      ];

    expect(calendarEventField).toBeDefined();
  });

  it('indexes the calendarEvent foreign key', () => {
    const calendarEventIdIndex =
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.indexes.calendarEventIdIndex
          .universalIdentifier
      ];

    expect(calendarEventIdIndex).toBeDefined();
  });

  it('keeps the callRecording table view focused on its label identifier and statuses', () => {
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

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(4);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.callRecording.fields.title.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.recordingRequestStatus
          .universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.startedAt.universalIdentifier,
      ]),
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

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(9);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.callRecording.fields.title.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.recordingRequestStatus
          .universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.startedAt.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.endedAt.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.video.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.audio.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.transcript.universalIdentifier,
        STANDARD_OBJECTS.callRecording.fields.summary.universalIdentifier,
      ]),
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.callRecording.fields.createdAt.universalIdentifier,
    );
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.callRecording.fields.createdBy.universalIdentifier,
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
