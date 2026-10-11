import { workflowFindRecordsActionSettingsSchema } from '../find-records-action-settings-schema';

const buildSettings = (filter: unknown) => ({
  input: {
    objectName: 'company',
    filter,
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
        recordFilters: [recordFilter],
        recordFilterGroups: [recordFilterGroup],
      }),
    );

    expect(result.success).toBe(true);
  });

  it('should drop properties derived from field metadata', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        recordFilters: [
          {
            ...recordFilter,
            type: 'TEXT',
            label: 'Name',
            displayValue: '{{trigger.name}}',
          },
        ],
      }),
    );

    expect(result.success).toBe(true);
    expect(result.data?.input.filter?.recordFilters?.[0]).toEqual(recordFilter);
  });

  it('should reject a record filter without a field', () => {
    const { fieldMetadataId: _fieldMetadataId, ...recordFilterWithoutField } =
      recordFilter;

    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({ recordFilters: [recordFilterWithoutField] }),
    );

    expect(result.success).toBe(false);
  });

  it('should reject an unknown logical operator', () => {
    const result = workflowFindRecordsActionSettingsSchema.safeParse(
      buildSettings({
        recordFilterGroups: [{ id: 'group-id', logicalOperator: 'XOR' }],
      }),
    );

    expect(result.success).toBe(false);
  });
});
