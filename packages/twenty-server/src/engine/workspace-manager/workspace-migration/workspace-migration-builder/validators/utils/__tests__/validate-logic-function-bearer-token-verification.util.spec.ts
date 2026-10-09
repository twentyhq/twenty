import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { validateLogicFunctionBearerTokenVerification } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-logic-function-bearer-token-verification.util';

const VALID_BEARER_TOKEN_VERIFICATION = {
  jwksUrl: 'https://login.botframework.com/v1/.well-known/keys',
  issuer: 'https://api.botframework.com',
  audienceServerVariable: 'TEAMS_BOT_APP_ID',
};

const validate = (bearerTokenVerification: unknown) =>
  validateLogicFunctionBearerTokenVerification({
    serverRouteTriggerSettings: {
      bearerTokenVerification: bearerTokenVerification as never,
    },
  });

describe('validateLogicFunctionBearerTokenVerification', () => {
  it('should accept a route without bearer token verification', () => {
    expect(
      validateLogicFunctionBearerTokenVerification({
        serverRouteTriggerSettings: null,
      }),
    ).toEqual([]);
    expect(validate(undefined)).toEqual([]);
  });

  it('should accept valid settings', () => {
    expect(validate(VALID_BEARER_TOKEN_VERIFICATION)).toEqual([]);
    expect(
      validate({
        ...VALID_BEARER_TOKEN_VERIFICATION,
        requiredKeyEndorsement: 'msteams',
      }),
    ).toEqual([]);
  });

  it.each([
    ['a non https jwksUrl', { jwksUrl: 'http://login.botframework.com/keys' }],
    ['a malformed jwksUrl', { jwksUrl: 'not a url' }],
    ['an empty issuer', { issuer: '' }],
    ['a missing audienceServerVariable', { audienceServerVariable: undefined }],
    ['a non string endorsement', { requiredKeyEndorsement: ['msteams'] }],
    ['an empty endorsement', { requiredKeyEndorsement: '' }],
  ])('should reject %s', (_, override) => {
    expect(
      validate({ ...VALID_BEARER_TOKEN_VERIFICATION, ...override }),
    ).toEqual([
      expect.objectContaining({
        code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      }),
    ]);
  });
});
