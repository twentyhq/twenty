import { getRelatedRecordPathUniversalIdentifier } from '@/application/deterministic-identifier/get-related-record-path-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const FIRST_FIELD = '33333333-3333-4333-8333-333333333333';
const SECOND_FIELD = '44444444-4444-4444-8444-444444444444';

describe('getRelatedRecordPathUniversalIdentifier', () => {
  it('derives a deterministic id from the ordered hop fields', () => {
    const universalIdentifier = getRelatedRecordPathUniversalIdentifier({
      applicationUniversalIdentifier: APP,
      fieldMetadataUniversalIdentifiers: [FIRST_FIELD, SECOND_FIELD],
    });

    expect(universalIdentifier).toBe(
      getRelatedRecordPathUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        fieldMetadataUniversalIdentifiers: [FIRST_FIELD, SECOND_FIELD],
      }),
    );
    expect(universalIdentifier).not.toBe(
      getRelatedRecordPathUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        fieldMetadataUniversalIdentifiers: [SECOND_FIELD, FIRST_FIELD],
      }),
    );
  });
});
