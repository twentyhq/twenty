import { buildSettingsExpressionDraftContextLine } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-settings-expression-draft-context-line.util';

describe('buildSettingsExpressionDraftContextLine', () => {
  it('describes the draft kind and quotes its expression', () => {
    expect(
      buildSettingsExpressionDraftContextLine({
        kind: 'formula',
        expression: ' amount * "2" ',
      }),
    ).toBe(
      'The user is editing a formula field on this page, possibly not saved yet. Its current expression in the editor is "amount * \\"2\\"". When they ask to fix or explain "this" expression, they mean this text.',
    );
  });

  it('caps long expressions', () => {
    const line = buildSettingsExpressionDraftContextLine({
      kind: 'validationRule',
      expression: 'a'.repeat(5000),
    });

    expect(line).toContain(`"${'a'.repeat(2000)}" (truncated)`);
    expect(line).not.toContain('a'.repeat(2001));
  });

  it.each([
    undefined,
    null,
    'amount > 0',
    { kind: 'unknownKind', expression: 'amount > 0' },
    { kind: 'constructor', expression: 'amount > 0' },
    { kind: 'validationRule', expression: '   ' },
    { kind: 'validationRule', expression: 42 },
  ])('returns null for an invalid draft %p', (draft) => {
    expect(buildSettingsExpressionDraftContextLine(draft)).toBeNull();
  });
});
