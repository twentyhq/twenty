import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { validateApplicationVariableScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-application-variable-scope.util';

describe('validateApplicationVariableScope', () => {
  it('should return no error for a secret and required workspace variable', () => {
    const errors = validateApplicationVariableScope({
      scope: 'WORKSPACE',
      isSecret: true,
      isRequired: true,
    });

    expect(errors).toEqual([]);
  });

  it('should return no error for a user variable that is neither secret nor required', () => {
    const errors = validateApplicationVariableScope({
      scope: 'USER',
      isSecret: false,
      isRequired: false,
    });

    expect(errors).toEqual([]);
  });

  it('should return an error for an unknown scope', () => {
    const errors = validateApplicationVariableScope({
      scope: 'TEAM',
      isSecret: false,
      isRequired: false,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
    );
    expect(errors[0].message).toContain('TEAM');
  });

  it('should return one error per rule a secret and required user variable breaks', () => {
    const errors = validateApplicationVariableScope({
      scope: 'USER',
      isSecret: true,
      isRequired: true,
    });

    expect(errors.map(({ message }) => message)).toEqual([
      'A user application variable cannot be secret',
      'A user application variable cannot be required',
    ]);
  });
});
