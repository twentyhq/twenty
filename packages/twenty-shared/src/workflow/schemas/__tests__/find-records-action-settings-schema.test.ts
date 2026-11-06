import { workflowFindRecordsActionSettingsSchema } from '../find-records-action-settings-schema';

const buildSettings = ({
  filter,
  orderBy,
}: {
  filter?: unknown;
  orderBy?: unknown;
}) => ({
  input: {
    objectName: 'company',
    filter,
    orderBy,
  },
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
});

const recordFilter = {
  id: 'filter-id',
  fieldMetadataId: 'field-id',
  operand: 'CONTAINS',
  value: '{{trigger.name}}',
  recordFilterGroupId: 'group-id',
};

const recordFilterGroup = { id: 'group-id', logicalOperator: 'AND' };

describe('workflowFindRecordsActionSettingsSchema', () => {
  it('should accept record filters that reference fields by id', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        filter: {
          recordFilters: [recordFilter],
          recordFilterGroups: [recordFilterGroup],
        },
      }),
    );

    expect(result.success).toBe(true);
  });

  it('should drop properties derived from field metadata', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        filter: {
          recordFilters: [
            {
              ...recordFilter,
              type: 'TEXT',
              label: 'Name',
              displayValue: '{{trigger.name}}',
            },
          ],
        },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.input.filter?.recordFilters?.[0]).toEqual(recordFilter);
  });

  it('should accept a record filter without an id or a value, like chart filters', () => {
    const {
      id: _id,
      value: _value,
      ...recordFilterWithoutIdAndValue
    } = recordFilter;

    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        filter: { recordFilters: [recordFilterWithoutIdAndValue] },
      }),
    );

    expect(result.success).toBe(true);
  });

  it('should reject a record filter whose value is not a string', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        filter: { recordFilters: [{ ...recordFilter, value: ['a'] }] },
      }),
    );

    expect(result.success).toBe(false);
  });

  it('should reject a record filter without a field', () => {
    const { fieldMetadataId: _fieldMetadataId, ...recordFilterWithoutField } =
      recordFilter;

    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({ filter: { recordFilters: [recordFilterWithoutField] } }),
    );

    expect(result.success).toBe(false);
  });

  it('should reject an unknown logical operator', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        filter: {
          recordFilterGroups: [{ id: 'group-id', logicalOperator: 'XOR' }],
        },
      }),
    );

    expect(result.success).toBe(false);
  });

  it('should accept record sorts that reference fields by id', () => {
    const recordSort = {
      id: 'sort-id',
      fieldMetadataId: 'field-id',
      direction: 'DESC',
      subFieldName: 'lastName',
    };

    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({ orderBy: { recordSorts: [recordSort] } }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.input.orderBy?.recordSorts).toEqual([recordSort]);
  });

  it('should reject a GraphQL order without record sorts, since the run computes it from them', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        orderBy: { gqlOperationOrderBy: [{ name: 'AscNullsLast' }] },
      }),
    );

    expect(result.success).toBe(false);
  });

  it('should accept the GraphQL order an older builder sends next to record sorts', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        orderBy: {
          recordSorts: [{ fieldMetadataId: 'field-id', direction: 'ASC' }],
          gqlOperationOrderBy: [{ name: 'AscNullsLast' }],
        },
      }),
    );

    expect(result.success).toBe(true);
  });

  it('should reject an unknown order by key', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({ orderBy: { recordSorts: [], direction: 'ASC' } }),
    );

    expect(result.success).toBe(false);
  });

  it('should reject a record sort with an unknown direction', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        orderBy: {
          recordSorts: [
            { fieldMetadataId: 'field-id', direction: 'AscNullsLast' },
          ],
        },
      }),
    );

    expect(result.success).toBe(false);
  });
});
