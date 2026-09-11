import ts from 'typescript';

export const getDocumentationImportDiagnostics = ({
  source,
  exportedModules,
}: {
  source: ts.SourceFile;
  exportedModules: ReadonlySet<string>;
}): ts.Diagnostic[] => {
  const diagnostics: ts.Diagnostic[] = [];

  const visit = (node: ts.Node) => {
    let specifier: ts.Node | undefined;

    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = node.moduleSpecifier;
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      specifier = node.arguments[0];
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument)
    ) {
      specifier = node.argument.literal;
    }

    if (
      specifier &&
      ts.isStringLiteralLike(specifier) &&
      (specifier.text === 'twenty-ui' ||
        specifier.text.startsWith('twenty-ui/')) &&
      !exportedModules.has(specifier.text)
    ) {
      diagnostics.push({
        category: ts.DiagnosticCategory.Error,
        code: 95000,
        file: source,
        start: specifier.getStart(source),
        length: specifier.getWidth(source),
        messageText: `${specifier.text} is not exported by twenty-ui/package.json.`,
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return diagnostics;
};
