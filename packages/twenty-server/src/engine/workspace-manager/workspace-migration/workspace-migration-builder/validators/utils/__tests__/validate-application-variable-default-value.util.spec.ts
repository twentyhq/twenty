import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { validateApplicationVariableDefaultValue } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-application-variable-default-value.util';

describe('validateApplicationVariableDefaultValue', () => {
  it('should return no error for a non-secret variable with a default value', () => {
    const errors = validateApplicationVariableDefaultValue({
      isSecret: false,
      defaultValue: 'true',
    });

    expect(errors).toEqual([]);
  });

  it('should return no error for a secret variable without a default value', () => {
    const errors = validateApplicationVariableDefaultValue({
      isSecret: true,
      defaultValue: null,
    });

    expect(errors).toEqual([]);
  });

  it('should return an error for a secret variable with a default value', () => {
    const errors = validateApplicationVariableDefaultValue({
      isSecret: true,
      defaultValue: 'personal-api-key',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
    );
  });
});
