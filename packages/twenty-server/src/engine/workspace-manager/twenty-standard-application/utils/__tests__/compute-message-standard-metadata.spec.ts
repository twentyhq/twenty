import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { VERTICAL_LIST_LAYOUT_POSITIONS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const MESSAGE_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageRecordPage;

describe('Message standard record page build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it('gives the message object a record page layout', () => {
    const messageObjectMetadata =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.universalIdentifier
      ];
    const pageLayout =
      allFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier[
        MESSAGE_RECORD_PAGE.universalIdentifier
      ];

    expect(pageLayout).toBeDefined();
    expect(pageLayout?.objectMetadataId).toBe(messageObjectMetadata?.id);
  });

  it('lays the message record page out as a home tab and a timeline tab', () => {
    expect(Object.keys(MESSAGE_RECORD_PAGE.tabs)).toEqual(['home', 'timeline']);

    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        MESSAGE_RECORD_PAGE.tabs.home.universalIdentifier
      ],
    ).toMatchObject({
      title: 'Home',
      icon: 'IconHome',
      position: 10,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    });
    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        MESSAGE_RECORD_PAGE.tabs.timeline.universalIdentifier
      ],
    ).toMatchObject({
      title: 'Timeline',
      icon: 'IconTimelineEvent',
      position: 20,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    });
  });

  it('points the home fields widget at the message record page fields view', () => {
    const fieldsView =
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.views.messageRecordPageFields
          .universalIdentifier
      ];
    const fieldsWidget =
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        MESSAGE_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier
      ];

    expect(fieldsView).toBeDefined();
    expect(fieldsWidget).toMatchObject({
      title: 'Fields',
      type: WidgetType.FIELDS,
      pageLayoutTabUniversalIdentifier:
        MESSAGE_RECORD_PAGE.tabs.home.universalIdentifier,
      position: VERTICAL_LIST_LAYOUT_POSITIONS.FIRST,
      configuration: {
        configurationType: WidgetConfigurationType.FIELDS,
        viewId: fieldsView?.id,
      },
      universalConfiguration: {
        configurationType: WidgetConfigurationType.FIELDS,
        viewUniversalIdentifier:
          STANDARD_OBJECTS.message.views.messageRecordPageFields
            .universalIdentifier,
      },
    });
  });

  it('shows the thread, participants and body on the message record page, and keeps the subject to the title', () => {
    const viewFieldFieldUniversalIdentifiers = Object.values(
      allFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (viewField) =>
          viewField.viewUniversalIdentifier ===
          STANDARD_OBJECTS.message.views.messageRecordPageFields
            .universalIdentifier,
      )
      .map((viewField) => viewField.fieldMetadataUniversalIdentifier);

    expect(viewFieldFieldUniversalIdentifiers).toHaveLength(7);
    expect(viewFieldFieldUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.message.fields.messageThread.universalIdentifier,
        STANDARD_OBJECTS.message.fields.messageParticipants.universalIdentifier,
        STANDARD_OBJECTS.message.fields.receivedAt.universalIdentifier,
        STANDARD_OBJECTS.message.fields.text.universalIdentifier,
        STANDARD_OBJECTS.message.fields.headerMessageId.universalIdentifier,
      ]),
    );
    // subject is the label identifier, so the record title already carries it
    expect(viewFieldFieldUniversalIdentifiers).not.toContain(
      STANDARD_OBJECTS.message.fields.subject.universalIdentifier,
    );
  });

  it('groups the message record page fields into General and System', () => {
    const generalGroup =
      allFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.views.messageRecordPageFields.viewFieldGroups
          .general.universalIdentifier
      ];
    const systemGroup =
      allFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.message.views.messageRecordPageFields.viewFieldGroups
          .system.universalIdentifier
      ];

    expect(generalGroup).toMatchObject({ position: 0, isVisible: true });
    expect(systemGroup).toMatchObject({ position: 1, isVisible: true });
  });
});
