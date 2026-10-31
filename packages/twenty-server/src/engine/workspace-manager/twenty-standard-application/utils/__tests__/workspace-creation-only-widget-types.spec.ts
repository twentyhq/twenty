import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { WidgetType } from 'twenty-shared/types';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const computeStandardFlatEntityMaps = (isWorkspaceCreation?: boolean) =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-09-25T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
    isWorkspaceCreation,
  }).allFlatEntityMaps;

const AGENT_CHAT_THREAD_CHAT_TAB =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.agentChatThreadRecordPage.tabs
    .chat;

describe('widget types only workspace creation builds', () => {
  it('should leave chat widgets, and the tab they fill, out of what upgrade commands build', () => {
    const allFlatEntityMaps = computeStandardFlatEntityMaps();

    const chatWidgets = Object.values(
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    ).filter((widget) => widget?.type === WidgetType.CHAT);

    expect(chatWidgets).toEqual([]);
    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        AGENT_CHAT_THREAD_CHAT_TAB.universalIdentifier
      ],
    ).toBeUndefined();
  });

  it('should build them for a new workspace', () => {
    const allFlatEntityMaps = computeStandardFlatEntityMaps(true);

    expect(
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        AGENT_CHAT_THREAD_CHAT_TAB.widgets.chat.universalIdentifier
      ]?.type,
    ).toBe(WidgetType.CHAT);
    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        AGENT_CHAT_THREAD_CHAT_TAB.universalIdentifier
      ]?.widgetUniversalIdentifiers,
    ).toEqual([AGENT_CHAT_THREAD_CHAT_TAB.widgets.chat.universalIdentifier]);
  });
});
