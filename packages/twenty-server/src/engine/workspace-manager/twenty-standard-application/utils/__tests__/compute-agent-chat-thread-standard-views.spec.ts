import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  ViewFilterOperand,
  ViewPresetFilter,
  ViewType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const INBOX_THREAD = STANDARD_OBJECTS.agentChatThread;

describe('AgentChatThread standard views build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const chatViews = Object.values(
    allFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (view) =>
        view.objectMetadataUniversalIdentifier ===
        INBOX_THREAD.universalIdentifier,
    )
    .sort((viewA, viewB) => viewA.position - viewB.position);

  it('builds the six inbox views in tab order with their presets', () => {
    expect(
      chatViews.map((view) => ({
        universalIdentifier: view.universalIdentifier,
        type: view.type,
        key: view.key,
        presetFilter: view.presetFilter,
        viewFieldUniversalIdentifiers: view.viewFieldUniversalIdentifiers,
      })),
    ).toEqual(
      [
        {
          view: INBOX_THREAD.views.open,
          presetFilter: ViewPresetFilter.INBOX_OPEN,
        },
        {
          view: INBOX_THREAD.views.needsInput,
          presetFilter: ViewPresetFilter.INBOX_OPEN,
        },
        {
          view: INBOX_THREAD.views.mentions,
          presetFilter: ViewPresetFilter.INBOX_MENTIONS,
        },
        {
          view: INBOX_THREAD.views.assignedToMe,
          presetFilter: ViewPresetFilter.INBOX_OPEN,
        },
        {
          view: INBOX_THREAD.views.snoozed,
          presetFilter: ViewPresetFilter.INBOX_SNOOZED,
        },
        {
          view: INBOX_THREAD.views.done,
          presetFilter: ViewPresetFilter.INBOX_DONE,
        },
      ].map(({ view, presetFilter }) => ({
        universalIdentifier: view.universalIdentifier,
        type: ViewType.INBOX,
        key: null,
        presetFilter,
        viewFieldUniversalIdentifiers: [],
      })),
    );
  });

  it('saves the needs input and assigned to me filters', () => {
    const chatViewUniversalIdentifiers = chatViews.map(
      (view) => view.universalIdentifier,
    );

    const chatViewFilters = Object.values(
      allFlatEntityMaps.flatViewFilterMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((viewFilter) =>
        chatViewUniversalIdentifiers.includes(
          viewFilter.viewUniversalIdentifier,
        ),
      )
      .map((viewFilter) => ({
        viewUniversalIdentifier: viewFilter.viewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          viewFilter.fieldMetadataUniversalIdentifier,
        operand: viewFilter.operand,
        value: viewFilter.value,
      }));

    expect(chatViewFilters).toEqual([
      {
        viewUniversalIdentifier:
          INBOX_THREAD.views.needsInput.universalIdentifier,
        fieldMetadataUniversalIdentifier:
          INBOX_THREAD.fields.pendingQuestionMessageId.universalIdentifier,
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: '',
      },
      {
        viewUniversalIdentifier:
          INBOX_THREAD.views.assignedToMe.universalIdentifier,
        fieldMetadataUniversalIdentifier:
          INBOX_THREAD.fields.assignee.universalIdentifier,
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: [],
        }),
      },
    ]);
  });
});
