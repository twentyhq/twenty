import { formatTemplateVariableWithFallback } from '../format-template-variable-with-fallback';
import { parseTemplateVariableWithFallback } from '../parse-template-variable-with-fallback';

describe('formatTemplateVariableWithFallback', () => {
  it('should write a bare variable when the fallback is empty', () => {
    expect(
      formatTemplateVariableWithFallback({ name: 'jobTitle', fallback: '' }),
    ).toBe('{{jobTitle}}');
  });

  it('should write the fallback as a Liquid default filter', () => {
    expect(
      formatTemplateVariableWithFallback({
        name: 'name.firstName',
        fallback: 'there',
      }),
    ).toBe('{{name.firstName | default: "there"}}');
  });

  it('should round-trip a fallback containing quotes, backslashes and pipes', () => {
    const templateVariableWithFallback = {
      name: 'jobTitle',
      fallback: 'the "boss" C:\\temp\\ | <b>',
    };

    expect(
      parseTemplateVariableWithFallback(
        formatTemplateVariableWithFallback(templateVariableWithFallback),
      ),
    ).toEqual(templateVariableWithFallback);
  });
});
