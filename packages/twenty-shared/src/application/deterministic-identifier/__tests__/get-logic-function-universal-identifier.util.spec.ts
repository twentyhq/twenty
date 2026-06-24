import { getLogicFunctionUniversalIdentifier } from '@/application/deterministic-identifier/get-logic-function-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getLogicFunctionUniversalIdentifier', () => {
  it('derives a deterministic id from the function name within its application', () => {
    expect(
      getLogicFunctionUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        name: 'sendEmail',
      }),
    ).toBe('4a470da0-dd48-5b7f-a1be-4e24fcc5b6c5');
  });
});
