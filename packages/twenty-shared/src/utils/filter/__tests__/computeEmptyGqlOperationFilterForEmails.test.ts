import { FieldMetadataType, ViewFilterOperand } from '@/types';
import { computeEmptyGqlOperationFilterForEmails } from '@/utils/filter/computeEmptyGqlOperationFilterForEmails';

describe('computeEmptyGqlOperationFilterForEmails', () => {
  const baseFilter = {
    id: '1',
    fieldMetadataId: 'f1',
    value: '',
    type: 'EMAILS' as const,
    operand: ViewFilterOperand.IS_EMPTY,
  };

  const field = { name: 'email', type: FieldMetadataType.EMAILS };

  it('should compute filter for primaryEmail subfield', () => {
    const result = computeEmptyGqlOperationFilterForEmails({
      recordFilter: { ...baseFilter, subFieldName: 'primaryEmail' },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('or');
    expect((result as any).or).toHaveLength(2);
  });

  it('should compute filter for additionalEmails subfield', () => {
    const result = computeEmptyGqlOperationFilterForEmails({
      recordFilter: { ...baseFilter, subFieldName: 'additionalEmails' },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('or');
  });

  it('should throw for unknown subfield', () => {
    expect(() =>
      computeEmptyGqlOperationFilterForEmails({
        recordFilter: { ...baseFilter, subFieldName: 'unknown' as any },
        correspondingFieldMetadataItem: field,
      }),
    ).toThrow('Unknown subfield name');
  });

  it('should compute combined filter when no subfield is specified', () => {
    const result = computeEmptyGqlOperationFilterForEmails({
      recordFilter: { ...baseFilter, subFieldName: undefined },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('and');
    expect((result as any).and).toHaveLength(2);
  });
});
