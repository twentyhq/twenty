import ts from 'typescript';

export const normalizeDocumentationDefaultValue = (
  defaultValue: { value: unknown } | null,
): string | null => {
  if (defaultValue === null || defaultValue.value === undefined) {
    return null;
  }

  const value = String(defaultValue.value).trim();

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
