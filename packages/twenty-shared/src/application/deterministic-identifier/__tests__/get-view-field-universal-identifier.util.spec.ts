import { getViewFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-view-field-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const VIEW = '44444444-4444-4444-8444-444444444444';
const FIELD = '33333333-3333-4333-8333-333333333333';

describe('getViewFieldUniversalIdentifier', () => {
  it('derives a deterministic id from the field it displays within its view', () => {
    expect(
      getViewFieldUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: VIEW,
        fieldMetadataUniversalIdentifier: FIELD,
      }),
    ).toBe('fe533473-ef93-5ed9-b709-b344aa94fb8d');
  });
});
