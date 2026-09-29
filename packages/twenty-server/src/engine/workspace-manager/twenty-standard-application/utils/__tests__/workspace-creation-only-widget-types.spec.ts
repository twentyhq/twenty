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

const COMPANY_CONVERSATIONS_TAB =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs
    .conversations;

// Upgrades from before 2.31 backfill record pages from these definitions while
// the widget type enum does not hold CHAT_THREADS yet: a single such widget in
// them fails the whole upgrade.
describe('widget types only workspace creation builds', () => {
  it('should leave chat threads widgets, and the tab they fill, out of what upgrade commands build', () => {
    const allFlatEntityMaps = computeStandardFlatEntityMaps();

    const chatThreadsWidgets = Object.values(
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    ).filter((widget) => widget?.type === WidgetType.CHAT_THREADS);

    expect(chatThreadsWidgets).toEqual([]);
    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        COMPANY_CONVERSATIONS_TAB.universalIdentifier
      ],
    ).toBeUndefined();
  });

  it('should build them for a new workspace', () => {
    const allFlatEntityMaps = computeStandardFlatEntityMaps(true);

    expect(
      allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        COMPANY_CONVERSATIONS_TAB.widgets.conversations.universalIdentifier
      ]?.type,
    ).toBe(WidgetType.CHAT_THREADS);
    expect(
      allFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        COMPANY_CONVERSATIONS_TAB.universalIdentifier
      ]?.widgetUniversalIdentifiers,
    ).toEqual([
      COMPANY_CONVERSATIONS_TAB.widgets.conversations.universalIdentifier,
    ]);
  });
});
