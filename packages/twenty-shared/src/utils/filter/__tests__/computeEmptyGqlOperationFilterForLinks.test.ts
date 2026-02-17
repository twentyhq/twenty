import { ViewFilterOperand } from '@/types';
import { computeEmptyGqlOperationFilterForLinks } from '@/utils/filter/computeEmptyGqlOperationFilterForLinks';

describe('computeEmptyGqlOperationFilterForLinks', () => {
  const baseFilter = {
    id: '1',
    fieldMetadataId: 'f1',
    value: '',
    type: 'LINKS' as const,
    operand: ViewFilterOperand.IS_EMPTY,
  };

  const field = { name: 'links' };

  it('should compute filter for primaryLinkLabel subfield', () => {
    const result = computeEmptyGqlOperationFilterForLinks({
      recordFilter: { ...baseFilter, subFieldName: 'primaryLinkLabel' },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('or');
  });

  it('should compute filter for primaryLinkUrl subfield', () => {
    const result = computeEmptyGqlOperationFilterForLinks({
      recordFilter: { ...baseFilter, subFieldName: 'primaryLinkUrl' },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('or');
  });

  it('should compute filter for secondaryLinks subfield', () => {
    const result = computeEmptyGqlOperationFilterForLinks({
      recordFilter: { ...baseFilter, subFieldName: 'secondaryLinks' },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('or');
  });

  it('should throw for unknown subfield', () => {
    expect(() =>
      computeEmptyGqlOperationFilterForLinks({
        recordFilter: { ...baseFilter, subFieldName: 'unknown' as any },
        correspondingFieldMetadataItem: field,
      }),
    ).toThrow('Unknown subfield name');
  });

  it('should compute combined filter when no subfield is specified', () => {
    const result = computeEmptyGqlOperationFilterForLinks({
      recordFilter: { ...baseFilter, subFieldName: undefined },
      correspondingFieldMetadataItem: field,
    });

    expect(result).toHaveProperty('and');
    expect((result as any).and).toHaveLength(3);
  });
});
