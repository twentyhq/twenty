import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { fromFlatPageLayoutToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-to-page-layout-dto.util';

const DATE_RANGE_FILTER_WITH_DEFAULT: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const buildFlatPageLayout = ({
  type,
  filters,
}: Pick<FlatPageLayout, 'type' | 'filters'>): FlatPageLayout => ({
  id: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90',
  universalIdentifier: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b91',
  workspaceId: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b92',
  applicationId: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b93',
  applicationUniversalIdentifier: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b94',
  name: 'Sales',
  type,
  objectMetadataId: null,
  objectMetadataUniversalIdentifier: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  isSystemSideEffect: false,
  isFirstTabPinned: true,
  filters,
  tabIds: [],
  tabUniversalIdentifiers: [],
  navigationMenuItemIds: [],
  navigationMenuItemUniversalIdentifiers: [],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  deletedAt: null,
});

describe('fromFlatPageLayoutToPageLayoutDto', () => {
  it.each([null, []])(
    'should read a dashboard with %p stored filters as having the built-in Date range filter',
    (filters) => {
      expect(
        fromFlatPageLayoutToPageLayoutDto(
          buildFlatPageLayout({ type: PageLayoutType.DASHBOARD, filters }),
        ).filters,
      ).toEqual([DASHBOARD_DATE_RANGE_FILTER]);
    },
  );

  it('should read the stored filters of a dashboard', () => {
    expect(
      fromFlatPageLayoutToPageLayoutDto(
        buildFlatPageLayout({
          type: PageLayoutType.DASHBOARD,
          filters: [DATE_RANGE_FILTER_WITH_DEFAULT],
        }),
      ).filters,
    ).toEqual([DATE_RANGE_FILTER_WITH_DEFAULT]);
  });

  it('should leave the filters of other layouts as stored', () => {
    expect(
      fromFlatPageLayoutToPageLayoutDto(
        buildFlatPageLayout({
          type: PageLayoutType.RECORD_PAGE,
          filters: null,
        }),
      ).filters,
    ).toBeNull();
  });
});
