import { replaceTemplateVariables } from '../replace-template-variables';

describe('replaceTemplateVariables', () => {
  it('should replace each variable with what the callback returns for it', () => {
    expect(
      replaceTemplateVariables(
        'Hi {{name.firstName | default: "there"}} at {{companyName}}',
        ({ name, fallback }) => `[${name}:${fallback ?? '-'}]`,
      ),
    ).toBe('Hi [name.firstName:there] at [companyName:-]');
  });

  it('should leave text that is not a variable untouched', () => {
    expect(
      replaceTemplateVariables(
        'Hi {{jobTitle | there}} at {company}',
        () => 'X',
      ),
    ).toBe('Hi {{jobTitle | there}} at {company}');
  });
});
