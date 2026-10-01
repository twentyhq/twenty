const STRING_LITERAL = /'(?:[^']|'')*'/g;
const WHOLE_ROW_REFERENCE = /(?<![\w"])"?([A-Za-z_]\w*)"?\.\*/g;
const QUALIFIED_COLUMN_REFERENCE = /(?<![\w"])"?([A-Za-z_]\w*)"?\."?(\w+)"?/g;
const IDENTIFIER = /(?<![\w".:$])"?(\w+)"?(?![\w".(])/g;

// Errs on the side of reporting: any identifier that could be one of the main
// alias's columns counts as a reference to it, and an alias used as a value
// (a whole-row reference such as to_jsonb("alias")) counts as every column.
export const collectQualifiedAndMainAliasColumnNames = ({
  expressions,
  mainAlias,
  columnNamesByAlias,
  aliases,
}: {
  expressions: string[];
  mainAlias: string;
  columnNamesByAlias: Record<string, string[]>;
  aliases: string[];
}): Record<string, string[]> => {
  const referencedColumnNamesByAlias: Record<string, Set<string>> = {};
  const mainAliasColumnNameSet = new Set(columnNamesByAlias[mainAlias] ?? []);
  const aliasSet = new Set(aliases);

  const addColumnNames = (alias: string, columnNames: string[]) => {
    const referencedColumnNames =
      referencedColumnNamesByAlias[alias] ?? new Set<string>();

    for (const columnName of columnNames) {
      referencedColumnNames.add(columnName);
    }

    referencedColumnNamesByAlias[alias] = referencedColumnNames;
  };

  for (const expression of expressions) {
    const expressionWithoutLiterals = expression
      .replace(STRING_LITERAL, "''")
      .replace(WHOLE_ROW_REFERENCE, (_wholeRowReference, alias: string) => {
        addColumnNames(alias, columnNamesByAlias[alias] ?? []);

        return '';
      });

    for (const [, alias, columnName] of expressionWithoutLiterals.matchAll(
      QUALIFIED_COLUMN_REFERENCE,
    )) {
      addColumnNames(alias, [columnName]);
    }

    const expressionWithoutQualifiedReferences =
      expressionWithoutLiterals.replace(QUALIFIED_COLUMN_REFERENCE, '');

    for (const [, identifier] of expressionWithoutQualifiedReferences.matchAll(
      IDENTIFIER,
    )) {
      if (aliasSet.has(identifier)) {
        addColumnNames(identifier, columnNamesByAlias[identifier] ?? []);
      } else if (mainAliasColumnNameSet.has(identifier)) {
        addColumnNames(mainAlias, [identifier]);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(referencedColumnNamesByAlias)
      .filter(([, columnNames]) => columnNames.size > 0)
      .map(([alias, columnNames]) => [alias, [...columnNames]]),
  );
};
