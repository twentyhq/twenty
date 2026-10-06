import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const isEditDashboardFiltersAvailable = ({
  isDashboardPageLayoutInEditMode,
  isDashboardFiltersEnabled,
}: {
  isDashboardPageLayoutInEditMode: boolean;
  isDashboardFiltersEnabled: boolean;
}) =>
  evaluateConditionalAvailabilityExpression(
    STANDARD_COMMAND_MENU_ITEMS.editDashboardFilters
      .conditionalAvailabilityExpression,
    {
      pageType: 'RECORD_PAGE',
      isDashboardPageLayoutInEditMode,
      featureFlags: { IS_DASHBOARD_FILTERS_ENABLED: isDashboardFiltersEnabled },
      selectedRecords: [
        { id: 'dashboard-1', deletedAt: null, pageLayoutId: 'page-layout-1' },
      ],
      objectPermissions: { canUpdateObjectRecords: true },
    },
  );

describe('editDashboardFilters command menu item', () => {
  it('is available while a dashboard layout is edited and the flag is on', () => {
    expect(
      isEditDashboardFiltersAvailable({
        isDashboardPageLayoutInEditMode: true,
        isDashboardFiltersEnabled: true,
      }),
    ).toBe(true);
  });

  it('is hidden outside of dashboard edit mode', () => {
    expect(
      isEditDashboardFiltersAvailable({
        isDashboardPageLayoutInEditMode: false,
        isDashboardFiltersEnabled: true,
      }),
    ).toBe(false);
  });

  it('is hidden when the dashboard filters flag is off', () => {
    expect(
      isEditDashboardFiltersAvailable({
        isDashboardPageLayoutInEditMode: true,
        isDashboardFiltersEnabled: false,
      }),
    ).toBe(false);
  });
});
