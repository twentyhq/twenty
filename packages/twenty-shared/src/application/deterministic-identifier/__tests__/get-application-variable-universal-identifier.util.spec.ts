import { getApplicationVariableUniversalIdentifier } from '@/application/deterministic-identifier/get-application-variable-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getApplicationVariableUniversalIdentifier', () => {
  it('derives a deterministic id from the variable key within its application', () => {
    expect(
      getApplicationVariableUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        key: 'API_KEY',
      }),
    ).toBe('83da1579-61d6-55f5-8b6c-c6ef698608bf');
  });
});
