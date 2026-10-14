import { findMalformedTemplateVariable } from '../find-malformed-template-variable';

describe('findMalformedTemplateVariable', () => {
  it('should find nothing when every variable is well formed', () => {
    expect(
      findMalformedTemplateVariable(
        'Hi {{name.firstName | default: "there"}}, {{jobTitle}} at {company}',
      ),
    ).toBeUndefined();
  });

  it('should return the first malformed variable', () => {
    expect(
      findMalformedTemplateVariable(
        'Hi {{name.firstName}}, {{jobTitle | there}} and {{oops!}}',
      ),
    ).toBe('{{jobTitle | there}}');
  });

  it('should catch a variable with braces in its fallback', () => {
    expect(
      findMalformedTemplateVariable('Hi {{jobTitle | default: {there}}}'),
    ).toBe('{{jobTitle | default: {there}}');
  });

  it('should catch a variable that is never closed', () => {
    expect(findMalformedTemplateVariable('Hi {{jobTitle there')).toBe(
      '{{jobTitle there',
    );
  });
});
