import { NORMALIZATION_RULES } from '../../constants/normalization-rules.constant';
import { evaluateRules } from '../evaluate-rules.util';

describe('evaluateRules', () => {
  it('reports every rule that fired and applies them in sequence', () => {
    const result = evaluateRules({
      rules: NORMALIZATION_RULES,
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
    const result = evaluateRules({
      rules: NORMALIZATION_RULES,
      sourceText: undefined,
      translationText: 'Remplacez `&lt;path&gt;` par votre chemin',
    });

    expect(result.ruleNames).toEqual([]);
  });

  it('skips source-filtered rules when the source does not match', () => {
    const result = evaluateRules({
      rules: NORMALIZATION_RULES,
      sourceText: 'Escape a literal &lt; in prose',
      translationText: 'Échappez un &lt; littéral dans le texte',
    });

    expect(result.ruleNames).toEqual([]);
  });

  it('returns the translation untouched when no rule fires', () => {
    const result = evaluateRules({
      rules: NORMALIZATION_RULES,
      sourceText: 'Replace `<path>` with your path',
      translationText: 'Remplacez `<path>` par votre chemin',
    });

    expect(result.fixedText).toBe('Remplacez `<path>` par votre chemin');
    expect(result.ruleNames).toEqual([]);
  });
});
