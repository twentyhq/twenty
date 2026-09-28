import ts from 'typescript';

const COMPONENT_NAME_PATTERN = /^[A-Z][a-z]/;
const COMPONENT_SOURCE_PATTERN = /\.(tsx|d\.ts)$/;

export const getPublicComponentExports = ({
  checker,
  entryPoints,
}: {
  checker: ts.TypeChecker;
  entryPoints: { name: string; source: ts.SourceFile }[];
}) => {
  const components = new Map<
    string,
    { name: string; entryPoint: string; symbol: ts.Symbol }
  >();

  for (const { name: entryPoint, source } of entryPoints) {
    const moduleSymbol = checker.getSymbolAtLocation(source);

    if (!moduleSymbol) {
      throw new Error(`Could not read exports from ${entryPoint}`);
    }

    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const symbol =
        exported.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(exported)
          : exported;
      const declaration = symbol.valueDeclaration;

      if (
        !declaration ||
        !COMPONENT_NAME_PATTERN.test(exported.name) ||
        !COMPONENT_SOURCE_PATTERN.test(declaration.getSourceFile().fileName)
      ) {
        continue;
      }

      const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
      const isCallable = type.getCallSignatures().length > 0;
      const hasComponentParts = type
        .getProperties()
        .some(
          (part) =>
            COMPONENT_NAME_PATTERN.test(part.name) &&
            checker
              .getTypeOfSymbolAtLocation(part, declaration)
              .getCallSignatures().length > 0,
        );

      if (isCallable || hasComponentParts) {
        components.set(exported.name, {
          name: exported.name,
          entryPoint,
          symbol,
        });
      }
    }
  }

  return [...components.values()];
};
