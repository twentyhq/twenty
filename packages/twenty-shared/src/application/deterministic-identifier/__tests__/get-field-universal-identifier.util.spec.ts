import { getFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-field-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getFieldUniversalIdentifier', () => {
  it('derives a deterministic id from the field name within its object', () => {
    expect(
      getFieldUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
        name: 'createdAt',
      }),
    ).toBe('b5cc95b6-e78f-531f-b74e-25bf891e8ec7');
  });
});
