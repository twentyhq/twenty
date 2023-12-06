export const parseFilterContent = (filterQuery: string): string[] => {
  let bracketsCounter = 0;
  let doubleQuoteClosed = true;
  let singleQuoteClosed = true;
  let parenthesisCounter = 0;
  const predicates: string[] = [];
  let currentPredicates = '';

  for (const c of filterQuery) {
    if (c === ')') parenthesisCounter--;

    if (c === '[') bracketsCounter++;

    if (c === ']') bracketsCounter--;

    if (c === '"') doubleQuoteClosed = !doubleQuoteClosed;

    if (c === "'") singleQuoteClosed = !singleQuoteClosed;

    if (
      c === ',' &&
      parenthesisCounter === 1 &&
      bracketsCounter === 0 &&
      doubleQuoteClosed &&
      singleQuoteClosed
    ) {
      predicates.push(currentPredicates);
      currentPredicates = '';
      continue;
    }

    if (parenthesisCounter >= 1) currentPredicates += c;

    if (c === '(') parenthesisCounter++;
  }

  predicates.push(currentPredicates);

  return predicates;
};
