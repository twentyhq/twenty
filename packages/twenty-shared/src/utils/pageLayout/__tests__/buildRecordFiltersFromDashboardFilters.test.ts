import {
  type DashboardFilterSlot,
  FieldMetadataType,
  ViewFilterOperand,
} from '@/types';
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

const CREATED_AT_FIELD = {
  id: 'created-at-field-id',
  type: FieldMetadataType.DATE_TIME,
};

const OWNER_FIELD = {
  id: 'owner-field-id',
  type: FieldMetadataType.RELATION,
};

const FIELD_METADATA_ITEMS = [CREATED_AT_FIELD, OWNER_FIELD];

describe('buildRecordFiltersFromDashboardFilters', () => {
  it('builds one record filter for a bound slot with a value', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: {
          operand: ViewFilterOperand.IS_AFTER,
          value: '2024-01-01T00:00:00.000Z',
        },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      {
        id: 'dashboard-filter-slot-date-slot',
        fieldMetadataId: CREATED_AT_FIELD.id,
        type: 'DATE_TIME',
        operand: ViewFilterOperand.IS_AFTER,
        value: '2024-01-01T00:00:00.000Z',
        subFieldName: undefined,
        relationTargetFieldMetadataId: undefined,
      },
    ]);
  });

  it('derives the filter type from the bound field, not from the slot', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [{ ...DATE_SLOT, filterType: 'DATE' }],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      expect.objectContaining({ type: 'DATE_TIME' }),
    ]);
  });

  it('produces nothing for an unbound slot', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
      bindings: {},
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('produces nothing for a slot explicitly bound to null', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
      bindings: { [DATE_SLOT.id]: null },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('produces nothing when the slot has no value', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {},
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('produces nothing when the operand expects a value and the value is empty', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_AFTER, value: '' },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('keeps a valueless operand such as IS_TODAY', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      expect.objectContaining({ operand: ViewFilterOperand.IS_TODAY }),
    ]);
  });

  it('carries the relation target field and sub field through', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [OWNER_SLOT],
      values: {
        [OWNER_SLOT.id]: {
          operand: ViewFilterOperand.IS,
          value:
            '{"isCurrentWorkspaceMemberSelected":true,"selectedRecordIds":[]}',
        },
      },
      bindings: {
        [OWNER_SLOT.id]: {
          fieldMetadataId: OWNER_FIELD.id,
          subFieldName: 'firstName',
          relationTargetFieldMetadataId: 'target-field-id',
        },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId: OWNER_FIELD.id,
        type: 'RELATION',
        subFieldName: 'firstName',
        relationTargetFieldMetadataId: 'target-field-id',
      }),
    ]);
  });

  it('produces nothing when the operand is not allowed for the slot type', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.CONTAINS, value: 'x' },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('produces nothing when the value does not match the slot type', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: {
          operand: ViewFilterOperand.IS_AFTER,
          value: 'garbage',
        },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('produces nothing when the binding points to an unknown field', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: 'deleted-field-id' },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(recordFilters).toEqual([]);
  });

  it('builds filters for several slots independently', () => {
    const recordFilters = buildRecordFiltersFromDashboardFilters({
      slots: [DATE_SLOT, OWNER_SLOT],
      values: {
        [DATE_SLOT.id]: { operand: ViewFilterOperand.IS_TODAY, value: '' },
        [OWNER_SLOT.id]: { operand: ViewFilterOperand.IS, value: '' },
      },
      bindings: {
        [DATE_SLOT.id]: { fieldMetadataId: CREATED_AT_FIELD.id },
        [OWNER_SLOT.id]: { fieldMetadataId: OWNER_FIELD.id },
      },
      fieldMetadataItems: FIELD_METADATA_ITEMS,
    });

    expect(
      recordFilters.map((recordFilter) => recordFilter.fieldMetadataId),
    ).toEqual([CREATED_AT_FIELD.id]);
  });
});
