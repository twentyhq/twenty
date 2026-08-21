import { ESCAPED_INLINE_CODE_TAGS_RULE } from '../escaped-inline-code-tags.rule';

const { detect, fix, sourceFilter } = ESCAPED_INLINE_CODE_TAGS_RULE;

describe('ESCAPED_INLINE_CODE_TAGS_RULE', () => {
  it('repairs an escaped tag inside an inline-code span', () => {
    const translationText = 'Remplacez `&lt;path&gt;` par votre chemin';

    expect(detect(translationText)).toBe(true);
    expect(fix(translationText)).toBe('Remplacez `<path>` par votre chemin');
  });

  it('repairs numeric and hexadecimal entities', () => {
    expect(fix('Utilisez `&#60;img&#x3E;` ici')).toBe('Utilisez `<img>` ici');
  });

  it('leaves escaped angle brackets outside inline code untouched', () => {
    expect(fix('Entourez-le de `&lt;Trans&gt;` et gardez &lt;3 en prose')).toBe(
      'Entourez-le de `<Trans>` et gardez &lt;3 en prose',
    );
  });

  it('does not flag a translation whose inline code is already correct', () => {
    expect(detect('Remplacez `<path>` par votre chemin')).toBe(false);
  });

  it('only selects sources that carry a tag inside inline code', () => {
    expect(sourceFilter?.('Replace `<path>` with your path')).toBe(true);
    expect(sourceFilter?.('Escape a literal &lt; in prose')).toBe(false);
  });

  it('is idempotent', () => {
    const once = fix('Remplacez `&lt;path&gt;` par `&lt;autre&gt;`');

    expect(fix(once)).toBe(once);
  });
});
