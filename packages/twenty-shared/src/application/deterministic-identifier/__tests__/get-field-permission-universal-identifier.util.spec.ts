import { getFieldPermissionUniversalIdentifier } from '@/application/deterministic-identifier/get-field-permission-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const ROLE = '55555555-5555-4555-8555-555555555555';
const FIELD = '33333333-3333-4333-8333-333333333333';

describe('getFieldPermissionUniversalIdentifier', () => {
  it('derives a deterministic id from the field within its role', () => {
    expect(
      getFieldPermissionUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        roleUniversalIdentifier: ROLE,
        fieldUniversalIdentifier: FIELD,
      }),
    ).toBe('d94e301d-96c3-559b-a92c-a1f0dbc218e7');
  });
});
