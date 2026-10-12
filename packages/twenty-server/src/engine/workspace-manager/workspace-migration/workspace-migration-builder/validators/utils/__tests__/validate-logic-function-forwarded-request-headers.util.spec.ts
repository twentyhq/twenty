import { HTTPMethod } from 'twenty-shared/types';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { validateLogicFunctionForwardedRequestHeaders } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-logic-function-forwarded-request-headers.util';

const buildHttpRouteTriggerSettings = (forwardedRequestHeaders: unknown) => ({
  path: '/route',
  httpMethod: HTTPMethod.POST,
  isAuthRequired: false,
  forwardedRequestHeaders: forwardedRequestHeaders as string[],
});

const buildServerRouteTriggerSettings = (forwardedRequestHeaders: unknown) => ({
  forwardedRequestHeaders: forwardedRequestHeaders as string[],
});

describe('validateLogicFunctionForwardedRequestHeaders', () => {
  it('should return no error when no route trigger is set', () => {
    expect(validateLogicFunctionForwardedRequestHeaders({})).toEqual([]);
    expect(
      validateLogicFunctionForwardedRequestHeaders({
        httpRouteTriggerSettings: null,
        serverRouteTriggerSettings: null,
      }),
    ).toEqual([]);
  });

  it('should return no error when forwardedRequestHeaders is absent', () => {
    expect(
      validateLogicFunctionForwardedRequestHeaders({
        httpRouteTriggerSettings: buildHttpRouteTriggerSettings(undefined),
        serverRouteTriggerSettings: buildServerRouteTriggerSettings(null),
      }),
    ).toEqual([]);
  });

  it('should return no error for non-credential headers', () => {
    expect(
      validateLogicFunctionForwardedRequestHeaders({
        httpRouteTriggerSettings: buildHttpRouteTriggerSettings([
          'x-hub-signature',
          'content-type',
        ]),
        serverRouteTriggerSettings: buildServerRouteTriggerSettings([
          'webhook-signature',
        ]),
      }),
    ).toEqual([]);
  });

  it('should return an error when an http route forwards a credential header', () => {
    const errors = validateLogicFunctionForwardedRequestHeaders({
      httpRouteTriggerSettings: buildHttpRouteTriggerSettings([
        'x-custom-header',
        'authorization',
      ]),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
    );
    expect(errors[0].message).toBe(
      'forwardedRequestHeaders cannot include credential headers: authorization',
    );
  });

  it('should return an error when a server route forwards a credential header', () => {
    const errors = validateLogicFunctionForwardedRequestHeaders({
      serverRouteTriggerSettings: buildServerRouteTriggerSettings(['cookie']),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'forwardedRequestHeaders cannot include credential headers: cookie',
    );
  });

  it('should match credential headers case-insensitively', () => {
    const errors = validateLogicFunctionForwardedRequestHeaders({
      httpRouteTriggerSettings: buildHttpRouteTriggerSettings([
        'Cookie',
        'PROXY-AUTHORIZATION',
      ]),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Cookie, PROXY-AUTHORIZATION');
  });

  it.each([
    ['a string', 'authorization'],
    ['an object', { 0: 'authorization' }],
    ['an array with a null entry', [null]],
    ['an array with a nested array', [['authorization']]],
    ['an array with a number', [42]],
  ])(
    'should return an error without throwing when forwardedRequestHeaders is %s',
    (_, forwardedRequestHeaders) => {
      const validate = () =>
        validateLogicFunctionForwardedRequestHeaders({
          httpRouteTriggerSettings: buildHttpRouteTriggerSettings(
            forwardedRequestHeaders,
          ),
        });

      expect(validate).not.toThrow();

      const errors = validate();

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe(
        LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      );
      expect(errors[0].message).toBe(
        'forwardedRequestHeaders must be an array of strings',
      );
    },
  );

  it('should validate the server route shape too', () => {
    const errors = validateLogicFunctionForwardedRequestHeaders({
      serverRouteTriggerSettings:
        buildServerRouteTriggerSettings('authorization'),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'forwardedRequestHeaders must be an array of strings',
    );
  });
});
