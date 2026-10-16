import ts from 'typescript';

const DO_NOT_TRANSLATE_CALL = /^doNotTranslate\(([\s\S]*?),?\s*\)$/;

export const normalizeDocumentationDefaultValue = (
  defaultValue: { value: unknown } | null,
): string | null => {
  if (defaultValue === null || defaultValue.value === undefined) {
    return null;
  }

  const rawValue = String(defaultValue.value).trim();
  const value = (rawValue.match(DO_NOT_TRANSLATE_CALL)?.[1] ?? rawValue).trim();

  if (value === 'undefined') {
    return null;
  }

  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    true,
    undefined,
    value,
  );
  const token = scanner.scan();
  const literalValue = scanner.getTokenValue();

  if (
    (token === ts.SyntaxKind.StringLiteral ||
      token === ts.SyntaxKind.NoSubstitutionTemplateLiteral) &&
    scanner.scan() === ts.SyntaxKind.EndOfFileToken
  ) {
    return literalValue;
  }

  return value;
};
