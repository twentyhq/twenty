import { workflowFindRecordsActionSettingsSchema } from '@/workflow/schemas/find-records-action-settings-schema';

describe('workflowFindRecordsActionSettingsSchema', () => {
  it('should reject unsupported filter operands', () => {
    const result = workflowFindRecordsActionSettingsSchema.shape.input.safeParse(
      {
        objectName: 'person',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'field-id',
              operand: 'EQUALS',
              value: 'John',
            },
          ],
        },
      },
    );

    expect(result.success).toBe(false);
  });

  it('should accept supported filter operands', () => {
    const result = workflowFindRecordsActionSettingsSchema.shape.input.safeParse(
      {
        objectName: 'person',
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'field-id',
              operand: 'CONTAINS',
              value: 'John',
            },
          ],
        },
      },
    );

    expect(result.success).toBe(true);
  });
});
