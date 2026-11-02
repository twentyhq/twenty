import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { validateLogicFunctionServerRouteApplication } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-logic-function-server-route-application.util';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7f1c2b9e-6a1d-4c55-9a2e-1a6f0d6c2b11';
const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '3d0b8f4a-2c7e-4b19-8f5d-9e4a1c7b6d22';

describe('validateLogicFunctionServerRouteApplication', () => {
  it('rejects a server route on a workspace custom application function', () => {
    const errors = validateLogicFunctionServerRouteApplication({
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
      workspaceCustomApplicationUniversalIdentifier:
        CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
    );
  });

  it('accepts a server route on an installed application function', () => {
    expect(
      validateLogicFunctionServerRouteApplication({
        applicationUniversalIdentifier:
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
        workspaceCustomApplicationUniversalIdentifier:
          CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });

  it('accepts a workspace custom application function without a server route', () => {
    expect(
      validateLogicFunctionServerRouteApplication({
        applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        serverRouteTriggerSettings: null,
        workspaceCustomApplicationUniversalIdentifier:
          CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });
});
