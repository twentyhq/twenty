import { ApplicationVariableEntityExceptionCode } from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { validateApplicationVariableScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-application-variable-scope.util';

describe('validateApplicationVariableScope', () => {
  it.each(['WORKSPACE', 'USER'])(
    'should return no error for the %s scope',
    (scope) => {
      expect(validateApplicationVariableScope({ scope })).toEqual([]);
    },
  );

  it('should return an error for an unknown scope', () => {
    const errors = validateApplicationVariableScope({ scope: 'TEAM' });

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
    );
    expect(errors[0].message).toContain('TEAM');
  });
});
