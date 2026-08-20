import {
  evaluateRules,
  NORMALIZATION_RULES,
} from './crowdin-normalization-rules';

const INLINE_CODE_RULE = NORMALIZATION_RULES.filter(
  (rule) => rule.name === 'escaped-inline-code-tags',
);
const UNICODE_RULE = NORMALIZATION_RULES.filter(
  (rule) => rule.name === 'escaped-unicode',
);

const evaluate = ({
  rules = NORMALIZATION_RULES,
  sourceText,
  translationText,
}: {
  rules?: typeof NORMALIZATION_RULES;
  sourceText?: string;
  translationText: string;
}) => evaluateRules({ rules, sourceText, translationText });

describe('escaped-inline-code-tags', () => {
  it('repairs an escaped tag inside an inline-code span', () => {
    const result = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText: 'Replace `<path>` with your path',
      translationText: 'Remplacez `&lt;path&gt;` par votre chemin',
    });

    expect(result.fixedText).toBe('Remplacez `<path>` par votre chemin');
    expect(result.ruleNames).toEqual(['escaped-inline-code-tags']);
  });

  it('repairs numeric and hexadecimal entities', () => {
    const result = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText: 'Use `<img>` here',
      translationText: 'Utilisez `&#60;img&#x3E;` ici',
    });

    expect(result.fixedText).toBe('Utilisez `<img>` ici');
  });

  it('leaves escaped angle brackets outside inline code untouched', () => {
    const result = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText: 'Wrap it in `<Trans>` and keep &lt;3 in prose',
      translationText:
        'Entourez-le de `&lt;Trans&gt;` et gardez &lt;3 en prose',
    });

    expect(result.fixedText).toBe(
      'Entourez-le de `<Trans>` et gardez &lt;3 en prose',
    );
  });

  it('does not flag a translation whose inline code is already correct', () => {
    const result = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText: 'Replace `<path>` with your path',
      translationText: 'Remplacez `<path>` par votre chemin',
    });

    expect(result.ruleNames).toEqual([]);
    expect(result.fixedText).toBe('Remplacez `<path>` par votre chemin');
  });

  it('skips strings whose source carries no tag in inline code', () => {
    const result = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText: 'Escape a literal &lt; in prose',
      translationText: 'Échappez un &lt; littéral dans le texte',
    });

    expect(result.ruleNames).toEqual([]);
  });

  it('is idempotent', () => {
    const translationText = 'Remplacez `&lt;path&gt;` par `&lt;autre&gt;`';
    const sourceText = 'Replace `<path>` with `<other>`';

    const once = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText,
      translationText,
    }).fixedText;
    const twice = evaluate({
      rules: INLINE_CODE_RULE,
      sourceText,
      translationText: once,
    }).fixedText;

    expect(twice).toBe(once);
  });
});

describe('escaped-unicode', () => {
  it('restores characters that leaked as literal \\uXXXX sequences', () => {
    const result = evaluate({
      rules: UNICODE_RULE,
      translationText: '\\u62db\\u8058',
    });

    expect(result.fixedText).toBe('招聘');
    expect(result.ruleNames).toEqual(['escaped-unicode']);
  });

  it('restores surrogate pairs', () => {
    const result = evaluate({
      rules: UNICODE_RULE,
      translationText: 'ok \\ud83d\\ude00',
    });

    expect(result.fixedText).toBe('ok 😀');
  });

  it('applies without a source string, since it can appear anywhere', () => {
    const result = evaluate({
      rules: UNICODE_RULE,
      translationText: '\\u00e9',
    });

    expect(result.fixedText).toBe('é');
  });

  it('leaves text without escaped sequences untouched', () => {
    const result = evaluate({ rules: UNICODE_RULE, translationText: '招聘' });

    expect(result.ruleNames).toEqual([]);
  });
});

describe('evaluateRules', () => {
  it('reports every rule that fired and applies them in sequence', () => {
    const result = evaluate({
      sourceText: 'Replace `<path>` with your path',
      translationText: '\\u62db `&lt;path&gt;`',
    });

    expect(result.fixedText).toBe('招 `<path>`');
    expect(result.ruleNames).toEqual([
      'escaped-unicode',
      'escaped-inline-code-tags',
    ]);
  });

  it('skips source-filtered rules when the source string is unknown', () => {
    const result = evaluate({
      translationText: 'Remplacez `&lt;path&gt;` par votre chemin',
    });

    expect(result.ruleNames).toEqual([]);
  });
});
