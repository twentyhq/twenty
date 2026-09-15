import { getViewFilterUniversalIdentifier } from '@/application/deterministic-identifier/get-view-filter-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const VIEW = '44444444-4444-4444-8444-444444444444';
const FIELD = '33333333-3333-4333-8333-333333333333';

describe('getViewFilterUniversalIdentifier', () => {
  it('derives a deterministic id from the field, operand and sub-field within its view', () => {
    expect(
      getViewFilterUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        viewUniversalIdentifier: VIEW,
        fieldMetadataUniversalIdentifier: FIELD,
        operand: 'is',
        subFieldName: null,
      }),
    ).toBe('d53c51f5-4717-5e81-8ac0-6062b8fdcff6');
  });
});
