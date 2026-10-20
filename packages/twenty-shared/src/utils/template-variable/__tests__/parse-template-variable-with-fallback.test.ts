import { parseTemplateVariableWithFallback } from '../parse-template-variable-with-fallback';

describe('parseTemplateVariableWithFallback', () => {
  it('should read a variable without a fallback', () => {
    expect(parseTemplateVariableWithFallback('{{ name.firstName }}')).toEqual({
      name: 'name.firstName',
    });
  });

  it('should read a Liquid default filter as the fallback', () => {
    expect(
      parseTemplateVariableWithFallback('{{jobTitle | default: "there"}}'),
    ).toEqual({
      name: 'jobTitle',
      fallback: 'there',
    });
    expect(
      parseTemplateVariableWithFallback(
        '{{ name.firstName|default:"Note: x | y" }}',
      ),
    ).toEqual({ name: 'name.firstName', fallback: 'Note: x | y' });
  });

  it('should unescape quotes and backslashes in the fallback', () => {
    expect(
      parseTemplateVariableWithFallback(
        '{{jobTitle | default: "the \\"boss\\" \\\\o/"}}',
      ),
    ).toEqual({ name: 'jobTitle', fallback: 'the "boss" \\o/' });
  });

  it('should reject near-miss fallback syntax', () => {
    expect(
      parseTemplateVariableWithFallback('{{jobTitle | there}}'),
    ).toBeUndefined();
    expect(
      parseTemplateVariableWithFallback('{{jobTitle | "there"}}'),
    ).toBeUndefined();
    expect(
      parseTemplateVariableWithFallback('{{jobTitle | default: there}}'),
    ).toBeUndefined();
    expect(
      parseTemplateVariableWithFallback("{{jobTitle | default: 'there'}}"),
    ).toBeUndefined();
    expect(
      parseTemplateVariableWithFallback('{{jobTitle | default: “there”}}'),
    ).toBeUndefined();
    expect(
      parseTemplateVariableWithFallback('{{jobTitle | default: {there}}}'),
    ).toBeUndefined();
  });

  it('should reject anything that is not exactly one variable', () => {
    expect(
      parseTemplateVariableWithFallback('Hi {{jobTitle}}'),
    ).toBeUndefined();
    expect(parseTemplateVariableWithFallback('{{job-title}}')).toBeUndefined();
  });
});
