import { getSelectOptionUniversalIdentifier } from '@/application/deterministic-identifier/get-select-option-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const FIELD = '33333333-3333-4333-8333-333333333333';

describe('getSelectOptionUniversalIdentifier', () => {
  it('derives a deterministic id from the option value within its field', () => {
    expect(
      getSelectOptionUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        fieldUniversalIdentifier: FIELD,
        value: 'OPTION_A',
      }),
    ).toBe('656c6ef0-1b13-5cc0-8c65-99700f364fa9');
  });
});
