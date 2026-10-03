import { LOCALIZED_EXPRESSION_DIGITS_RULE } from '../localized-expression-digits.rule';

const { detect, fix } = LOCALIZED_EXPRESSION_DIGITS_RULE;

describe('LOCALIZED_EXPRESSION_DIGITS_RULE', () => {
  it('restores an Arabic-Indic digit translated inside a JSX attribute expression', () => {
    const translationText = '<CardGroup cols={٢}>';

    expect(detect(translationText)).toBe(true);
    expect(fix(translationText)).toBe('<CardGroup cols={2}>');
  });

  it.each([
    ['<CardGroup cols={۳}>', '<CardGroup cols={3}>'],
    ['<Columns cols={४}>', '<Columns cols={4}>'],
    ['<Frame width={١٢٠} height={٨٠}>', '<Frame width={120} height={80}>'],
  ])(
    'restores digits from any decimal script: %s',
    (translationText, expected) => {
      expect(fix(translationText)).toBe(expected);
    },
  );

  it('keeps localized digits in the prose the reader sees', () => {
    const translationText = 'اتبع ٢ خطوات <Steps count={2}>';

    expect(detect(translationText)).toBe(false);
    expect(fix(translationText)).toBe(translationText);
  });

  it('only touches the expression, not the prose around it', () => {
    expect(fix('الخطوة ٢ <CardGroup cols={٢}>')).toBe(
      'الخطوة ٢ <CardGroup cols={2}>',
    );
  });

  it('leaves ASCII expressions alone', () => {
    expect(detect('<CardGroup cols={2}>')).toBe(false);
  });

  it('runs without the source text', () => {
    expect(LOCALIZED_EXPRESSION_DIGITS_RULE.needsSourceText).toBeUndefined();
    expect(LOCALIZED_EXPRESSION_DIGITS_RULE.sourceFilter).toBeUndefined();
  });
});
