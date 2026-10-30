import { getRelatedRecordPathUniversalIdentifier } from '@/application/deterministic-identifier/get-related-record-path-universal-identifier.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const FIRST_FIELD = '33333333-3333-4333-8333-333333333333';
const SECOND_FIELD = '44444444-4444-4444-8444-444444444444';

describe('getRelatedRecordPathUniversalIdentifier', () => {
  it('derives a deterministic id from the ordered hop fields', () => {
    expect(
      getRelatedRecordPathUniversalIdentifier({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifiers: [FIRST_FIELD, SECOND_FIELD],
      }),
    ).toBe('34000440-31a0-5e67-ae24-68a024fc1124');
  });

  it('depends on the hop order', () => {
    expect(
      getRelatedRecordPathUniversalIdentifier({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifiers: [SECOND_FIELD, FIRST_FIELD],
      }),
    ).not.toBe('34000440-31a0-5e67-ae24-68a024fc1124');
  });
});
