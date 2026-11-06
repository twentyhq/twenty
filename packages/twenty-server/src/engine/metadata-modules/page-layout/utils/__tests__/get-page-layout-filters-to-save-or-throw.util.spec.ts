import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { getPageLayoutFiltersToSaveOrThrow } from 'src/engine/metadata-modules/page-layout/utils/get-page-layout-filters-to-save-or-throw.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '0e2a4a2e-9f43-4b0e-8a57-5d6b2b4e7c01';
const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
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

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  id: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  label: 'Close date',
  type: PageLayoutFilterType.DATE,
  position: 1,
  defaultValue: null,
};

const withNullPrototype = <TValue extends object>(value: TValue): TValue =>
  Object.assign(Object.create(null), value);

const getFiltersToSave = ({
  applicationUniversalIdentifier,
  type = PageLayoutType.DASHBOARD,
  existingFilters = [PERIOD_FILTER],
  filtersInput,
}: {
  applicationUniversalIdentifier: string;
  type?: PageLayoutType;
  existingFilters?: PageLayoutFilter[] | null;
  filtersInput: PageLayoutFilter[] | null | undefined;
}) =>
  getPageLayoutFiltersToSaveOrThrow({
    existingPageLayout: {
      id: 'b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90',
      type,
      filters: existingFilters,
      applicationUniversalIdentifier,
    },
    filtersInput,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('getPageLayoutFiltersToSaveOrThrow', () => {
  it('should keep the stored filters when the input omits them', () => {
    const existingFilters = [PERIOD_FILTER];

    expect(
      getFiltersToSave({
        applicationUniversalIdentifier:
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        existingFilters,
        filtersInput: undefined,
      }),
    ).toBe(existingFilters);
  });

  it('should keep the stored filters of an installed dashboard when the input is unchanged', () => {
    const existingFilters = [PERIOD_FILTER];

    expect(
      getFiltersToSave({
        applicationUniversalIdentifier:
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        existingFilters,
        filtersInput: [withNullPrototype({ ...PERIOD_FILTER })],
      }),
    ).toBe(existingFilters);
  });

  it('should keep the stored filters of an installed dashboard when the input only reorders them', () => {
    const existingFilters = [CLOSE_DATE_FILTER, PERIOD_FILTER];

    expect(
      getFiltersToSave({
        applicationUniversalIdentifier:
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        existingFilters,
        filtersInput: [PERIOD_FILTER, CLOSE_DATE_FILTER],
      }),
    ).toBe(existingFilters);
  });

  it('should treat an empty list as no filters', () => {
    expect(
      getFiltersToSave({
        applicationUniversalIdentifier:
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        existingFilters: null,
        filtersInput: [],
      }),
    ).toBeNull();
  });

  it.each([
    ['the workspace', WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER],
    ['twenty standard', TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
  ])(
    'should save changed filters on a dashboard owned by %s',
    (_owner, applicationUniversalIdentifier) => {
      expect(
        getFiltersToSave({
          applicationUniversalIdentifier,
          filtersInput: [{ ...PERIOD_FILTER, label: 'Quarter' }],
        }),
      ).toEqual([{ ...PERIOD_FILTER, label: 'Quarter' }]);
    },
  );

  it('should leave filters on an installed non dashboard layout to the validator', () => {
    expect(
      getFiltersToSave({
        applicationUniversalIdentifier:
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        type: PageLayoutType.RECORD_PAGE,
        existingFilters: null,
        filtersInput: [PERIOD_FILTER],
      }),
    ).toEqual([PERIOD_FILTER]);
  });

  it.each([
    ['cleared', null],
    ['relabeled', [{ ...PERIOD_FILTER, label: 'Quarter' }]],
    ['given a new default', [{ ...PERIOD_FILTER, defaultValue: null }]],
  ])(
    'should reject the filters of an installed dashboard being %s',
    (_change, filtersInput) => {
      expect(() =>
        getFiltersToSave({
          applicationUniversalIdentifier:
            INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
          filtersInput,
        }),
      ).toThrow(
        new PageLayoutException(
          'Filters of dashboard page layout "b4f6a3f0-2c1d-4e8b-9a7c-3d5e6f7a8b90" are defined by the application that installed it and cannot be changed',
          PageLayoutExceptionCode.PAGE_LAYOUT_FILTERS_NOT_EDITABLE,
        ),
      );
    },
  );
});
