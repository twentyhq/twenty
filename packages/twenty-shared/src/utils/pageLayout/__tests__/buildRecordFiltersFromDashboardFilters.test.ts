import type {
  DashboardFilterBinding,
  DashboardFilterSlot,
  DashboardFilterValue,
} from '@/types/page-layout/DashboardFilter';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { buildRecordFiltersFromDashboardFilters } from '@/utils/pageLayout/buildRecordFiltersFromDashboardFilters';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date-slot',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner-slot',
  label: 'Owner',
  filterType: 'RELATION',
};

const CITY_SLOT: DashboardFilterSlot = {
  id: 'city-slot',
  label: 'City',
  filterType: 'ADDRESS',
};

const CREATED_AT_FIELD = {
  id: 'created-at-field-id',
  type: FieldMetadataType.DATE_TIME,
};

const ACCOUNT_OWNER_FIELD = {
  id: 'account-owner-field-id',
  type: FieldMetadataType.RELATION,
};

const ADDRESS_FIELD = {
  id: 'address-field-id',
  type: FieldMetadataType.ADDRESS,
};

const FIELD_METADATA_ITEMS = [
  CREATED_AT_FIELD,
  ACCOUNT_OWNER_FIELD,
  ADDRESS_FIELD,
];

const DATE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_AFTER,
  value: '2026-01-01T00:00:00.000Z',
};

const CREATED_AT_BINDING: DashboardFilterBinding = {
  fieldMetadataId: CREATED_AT_FIELD.id,
};

describe('buildRecordFiltersFromDashboardFilters', () => {
  it('emits one filter for a bound slot with a value', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: { [DATE_SLOT.id]: DATE_VALUE },
      bindings: { [DATE_SLOT.id]: CREATED_AT_BINDING },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      {
        id: 'dashboard-filter-date-slot',
        fieldMetadataId: CREATED_AT_FIELD.id,
        type: 'DATE_TIME',
        operand: ViewFilterOperand.IS_AFTER,
        value: DATE_VALUE.value,
        subFieldName: undefined,
        relationTargetFieldMetadataId: null,
      },
    ]);
  });

  it('emits nothing for a slot without a value', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {},
      bindings: { [DATE_SLOT.id]: CREATED_AT_BINDING },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('emits nothing when the operand expects a value and the value is empty', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_AFTER, value: '' },
      },
      bindings: { [DATE_SLOT.id]: CREATED_AT_BINDING },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('emits a filter for a valueless operand with an empty value', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
      bindings: { [DATE_SLOT.id]: CREATED_AT_BINDING },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toHaveLength(1);
    expect(recordFilters[0]?.operand).toBe(ViewFilterOperand.IS_TODAY);
  });

  it('emits nothing for a null binding', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: { [DATE_SLOT.id]: DATE_VALUE },
      bindings: { [DATE_SLOT.id]: null },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('emits nothing when the slot has no binding entry', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: { [DATE_SLOT.id]: DATE_VALUE },
      bindings: {},
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('emits nothing when the widget has no bindings at all', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: { [DATE_SLOT.id]: DATE_VALUE },
      bindings: undefined,
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('emits nothing when the bound field is unknown', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: { [DATE_SLOT.id]: DATE_VALUE },
      bindings: { [DATE_SLOT.id]: { fieldMetadataId: 'deleted-field-id' } },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('carries subFieldName from a composite field binding', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [CITY_SLOT],
      values: {
        [CITY_SLOT.id]: {
          operand: ViewFilterOperand.CONTAINS,
          value: 'Paris',
        },
      },
      bindings: {
        [CITY_SLOT.id]: {
          fieldMetadataId: ADDRESS_FIELD.id,
          subFieldName: 'addressCity',
        },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      {
        id: 'dashboard-filter-city-slot',
        fieldMetadataId: ADDRESS_FIELD.id,
        type: 'ADDRESS',
        operand: ViewFilterOperand.CONTAINS,
        value: 'Paris',
        subFieldName: 'addressCity',
        relationTargetFieldMetadataId: null,
      },
    ]);
  });

  it('carries relationTargetFieldMetadataId from a relation binding', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [OWNER_SLOT],
      values: {
        [OWNER_SLOT.id]: {
          operand: ViewFilterOperand.IS,
          value: '["workspace-member-id"]',
        },
      },
      bindings: {
        [OWNER_SLOT.id]: {
          fieldMetadataId: ACCOUNT_OWNER_FIELD.id,
          relationTargetFieldMetadataId: 'target-field-id',
        },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      {
        id: 'dashboard-filter-owner-slot',
        fieldMetadataId: ACCOUNT_OWNER_FIELD.id,
        type: 'RELATION',
        operand: ViewFilterOperand.IS,
        value: '["workspace-member-id"]',
        subFieldName: undefined,
        relationTargetFieldMetadataId: 'target-field-id',
      },
    ]);
  });

  it('emits two filters for two bound slots', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT, OWNER_SLOT],
      values: {
        [DATE_SLOT.id]: DATE_VALUE,
        [OWNER_SLOT.id]: {
          operand: ViewFilterOperand.IS,
          value: '["workspace-member-id"]',
        },
      },
      bindings: {
        [DATE_SLOT.id]: CREATED_AT_BINDING,
        [OWNER_SLOT.id]: { fieldMetadataId: ACCOUNT_OWNER_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters.map((recordFilter) => recordFilter.id)).toEqual([
      'dashboard-filter-date-slot',
      'dashboard-filter-owner-slot',
    ]);
    expect(
      recordFilters.every(
        (recordFilter) => recordFilter.recordFilterGroupId === undefined,
      ),
    ).toBe(true);
  });
});
