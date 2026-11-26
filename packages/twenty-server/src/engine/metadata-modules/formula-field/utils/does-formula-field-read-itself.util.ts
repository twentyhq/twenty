import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  isDefined,
  listFieldMetadataFormulaFieldNodes,
} from 'twenty-shared/utils';

type ReadableFormula =
  | Partial<Pick<FieldMetadataFormula, 'tree' | 'currencyCodeTree'>>
  | null
  | undefined;

const listReadUniversalIdentifiers = (formula: ReadableFormula): string[] =>
  listFieldMetadataFormulaFieldNodes({ formula }).flatMap(
    ({ fieldUniversalIdentifier, relationFieldUniversalIdentifier }) =>
      [relationFieldUniversalIdentifier, fieldUniversalIdentifier].filter(
        isDefined,
      ),
  );

export const doesFormulaFieldReadItself = ({
  universalIdentifier,
  formula,
  findFormula,
}: {
  universalIdentifier: string;
  formula: ReadableFormula;
  findFormula: (fieldUniversalIdentifier: string) => ReadableFormula;
}): boolean => {
  const visitedUniversalIdentifiers = new Set<string>();
  const universalIdentifiersToVisit = listReadUniversalIdentifiers(formula);

  while (universalIdentifiersToVisit.length > 0) {
    const readUniversalIdentifier = universalIdentifiersToVisit.pop();

    if (
      !isDefined(readUniversalIdentifier) ||
      visitedUniversalIdentifiers.has(readUniversalIdentifier)
    ) {
      continue;
    }

    if (readUniversalIdentifier === universalIdentifier) {
      return true;
    }

    visitedUniversalIdentifiers.add(readUniversalIdentifier);
    universalIdentifiersToVisit.push(
      ...listReadUniversalIdentifiers(findFormula(readUniversalIdentifier)),
    );
  }

  return false;
};
