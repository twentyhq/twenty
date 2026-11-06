import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { getPageLayoutFiltersToSave } from 'src/engine/metadata-modules/page-layout/utils/get-page-layout-filters-to-save.util';

const DATE_RANGE_FILTER_WITH_DEFAULT: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const withNullPrototype = <TValue extends object>(value: TValue): TValue =>
  Object.assign(Object.create(null), value);

const getFiltersToSave = ({
  type = PageLayoutType.DASHBOARD,
  existingFilters = [DATE_RANGE_FILTER_WITH_DEFAULT],
  filtersInput,
}: {
  type?: PageLayoutType;
  existingFilters?: PageLayoutFilter[] | null;
  filtersInput: PageLayoutFilter[] | null | undefined;
}) =>
  getPageLayoutFiltersToSave({
    existingFilters,
    pageLayoutType: type,
    filtersInput,
  });

describe('getPageLayoutFiltersToSave', () => {
  it('should keep the stored filters when the input omits them', () => {
    const existingFilters = [DATE_RANGE_FILTER_WITH_DEFAULT];

    expect(getFiltersToSave({ existingFilters, filtersInput: undefined })).toBe(
      existingFilters,
    );
  });

  it('should keep the stored filters when the input is unchanged', () => {
    const existingFilters = [DATE_RANGE_FILTER_WITH_DEFAULT];

    expect(
      getFiltersToSave({
        existingFilters,
        filtersInput: [
          withNullPrototype({ ...DATE_RANGE_FILTER_WITH_DEFAULT }),
        ],
      }),
    ).toBe(existingFilters);
  });

  it('should keep nothing stored when the input is the built-in filter a dashboard reads without stored filters', () => {
    expect(
      getFiltersToSave({
        existingFilters: null,
        filtersInput: [DASHBOARD_DATE_RANGE_FILTER],
      }),
    ).toBeNull();
  });

  it('should save a default range on a dashboard without stored filters', () => {
    expect(
      getFiltersToSave({
        existingFilters: null,
        filtersInput: [DATE_RANGE_FILTER_WITH_DEFAULT],
      }),
    ).toEqual([DATE_RANGE_FILTER_WITH_DEFAULT]);
  });

  it.each([
    ['the built-in filter without a default', [DASHBOARD_DATE_RANGE_FILTER]],
    ['an empty list', []],
    ['null', null],
  ])(
    'should store null when the default range is cleared with %s',
    (_input, filtersInput) => {
      expect(getFiltersToSave({ filtersInput })).toBeNull();
    },
  );

  it('should store the built-in label and position whatever the input says', () => {
    expect(
      getFiltersToSave({
        existingFilters: null,
        filtersInput: [
          { ...DATE_RANGE_FILTER_WITH_DEFAULT, label: 'Quarter', position: 2 },
        ],
      }),
    ).toEqual([DATE_RANGE_FILTER_WITH_DEFAULT]);
  });

  it('should leave filters on a non dashboard layout to the validator', () => {
    expect(
      getFiltersToSave({
        type: PageLayoutType.RECORD_PAGE,
        existingFilters: null,
        filtersInput: [DASHBOARD_DATE_RANGE_FILTER],
      }),
    ).toEqual([DASHBOARD_DATE_RANGE_FILTER]);
  });

  it('should canonicalize by the type being saved, so a layout becoming a dashboard stores nothing for the built-in filter', () => {
    expect(
      getFiltersToSave({
        type: PageLayoutType.DASHBOARD,
        existingFilters: null,
        filtersInput: [DASHBOARD_DATE_RANGE_FILTER],
      }),
    ).toBeNull();
  });
});
