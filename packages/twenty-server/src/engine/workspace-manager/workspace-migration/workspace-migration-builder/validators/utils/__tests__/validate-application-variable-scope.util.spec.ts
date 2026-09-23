import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { validateApplicationVariableScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-application-variable-scope.util';

describe('validateApplicationVariableScope', () => {
  it('should return no error for a workspace variable with a value', () => {
    const errors = validateApplicationVariableScope({
      scope: 'WORKSPACE',
      value: 'enc:v2:value',
    });

    expect(errors).toEqual([]);
  });

  it('should return no error for a user variable without a value', () => {
    const errors = validateApplicationVariableScope({
      scope: 'USER',
      value: null,
    });

    expect(errors).toEqual([]);
  });

  it('should return an error for an unknown scope', () => {
    const errors = validateApplicationVariableScope({
      scope: 'TEAM',
      value: 'enc:v2:value',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe(
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
    );
    expect(errors[0]?.message).toContain('TEAM');
  });

  it('should return an error for a workspace variable without a value', () => {
    const errors = validateApplicationVariableScope({
      scope: 'WORKSPACE',
      value: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe(
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
    );
  });

  it('should return an error for a user variable with a value', () => {
    const errors = validateApplicationVariableScope({
      scope: 'USER',
      value: 'enc:v2:value',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe(
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
    );
  });
});
