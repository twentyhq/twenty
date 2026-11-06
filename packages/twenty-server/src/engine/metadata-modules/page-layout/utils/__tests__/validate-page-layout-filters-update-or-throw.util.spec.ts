import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { validatePageLayoutFiltersUpdateOrThrow } from 'src/engine/metadata-modules/page-layout/utils/validate-page-layout-filters-update-or-throw.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c01';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c02';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const buildExistingPageLayout = ({
  applicationUniversalIdentifier,
  isSystemSideEffect = false,
}: {
  applicationUniversalIdentifier: string;
  isSystemSideEffect?: boolean;
}) => ({
  id: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90',
  filters: [PERIOD_FILTER],
  applicationUniversalIdentifier,
  isSystemSideEffect,
});

const validate = ({
  applicationUniversalIdentifier,
  isSystemSideEffect,
  filters,
}: {
  applicationUniversalIdentifier: string;
  isSystemSideEffect?: boolean;
  filters: PageLayoutFilter[] | null;
}) =>
  validatePageLayoutFiltersUpdateOrThrow({
    existingPageLayout: buildExistingPageLayout({
      applicationUniversalIdentifier,
      isSystemSideEffect,
    }),
    filters,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('validatePageLayoutFiltersUpdateOrThrow', () => {
  it('should let the workspace change the filters of its own layout', () => {
    expect(() =>
      validate({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        filters: null,
      }),
    ).not.toThrow();
  });

  it('should accept the unchanged filters of an application layout', () => {
    expect(() =>
      validate({
        applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
        filters: [{ ...PERIOD_FILTER }],
      }),
    ).not.toThrow();
  });

  it.each([
    ['cleared', null],
    ['relabeled', [{ ...PERIOD_FILTER, label: 'Quarter' }]],
    ['given a new default', [{ ...PERIOD_FILTER, defaultValue: null }]],
  ])(
    'should reject the filters of an application layout being %s',
    (_change, filters) => {
      expect(() =>
        validate({
          applicationUniversalIdentifier:
            OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
          filters,
        }),
      ).toThrow(
        new PageLayoutException(
          'Filters of page layout "b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90" are defined by its application and cannot be changed',
          PageLayoutExceptionCode.PAGE_LAYOUT_FILTERS_NOT_EDITABLE,
        ),
      );
    },
  );

  it('should reject a filter change on a layout the engine manages', () => {
    expect(() =>
      validate({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
        filters: null,
      }),
    ).toThrow(PageLayoutException);
  });
});
