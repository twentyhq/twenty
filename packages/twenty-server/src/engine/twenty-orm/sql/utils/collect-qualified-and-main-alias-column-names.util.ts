const STRING_LITERAL = /'(?:[^']|'')*'/g;
const QUALIFIED_COLUMN_REFERENCE = /"(\w+)"\."(\w+)"/g;
const IDENTIFIER = /(?<![\w".:$])"?(\w+)"?(?![\w".(])/g;

// Errs on the side of reporting: any identifier that could be one of the main
// alias's columns counts as a reference to it.
export const collectQualifiedAndMainAliasColumnNames = ({
  expressions,
  mainAlias,
  mainAliasColumnNames,
  aliases,
}: {
  expressions: string[];
  mainAlias: string;
  mainAliasColumnNames: string[];
  aliases: string[];
}): Record<string, string[]> => {
  const columnNamesByAlias: Record<string, Set<string>> = {};
  const mainAliasColumnNameSet = new Set(mainAliasColumnNames);
  const aliasSet = new Set(aliases);

  const addColumnName = (alias: string, columnName: string) => {
    columnNamesByAlias[alias] = (
      columnNamesByAlias[alias] ?? new Set<string>()
    ).add(columnName);
  };

  for (const expression of expressions) {
    const expressionWithoutLiterals = expression.replace(STRING_LITERAL, "''");

    for (const [, alias, columnName] of expressionWithoutLiterals.matchAll(
      QUALIFIED_COLUMN_REFERENCE,
    )) {
      addColumnName(alias, columnName);
    }

    const expressionWithoutQualifiedReferences =
      expressionWithoutLiterals.replace(QUALIFIED_COLUMN_REFERENCE, '');

    for (const [, identifier] of expressionWithoutQualifiedReferences.matchAll(
      IDENTIFIER,
    )) {
      if (mainAliasColumnNameSet.has(identifier) && !aliasSet.has(identifier)) {
        addColumnName(mainAlias, identifier);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(columnNamesByAlias).map(([alias, columnNames]) => [
      alias,
      [...columnNames],
    ]),
  );
};
