import { type FieldMetadataFormula } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaBindings,
  isDefined,
} from 'twenty-shared/utils';

export const doesFormulaFieldReadItself = ({
  universalIdentifier,
  formula,
  findFormula,
}: {
  universalIdentifier: string;
  formula: Partial<Pick<FieldMetadataFormula, 'bindings'>> | null;
  findFormula: (
    fieldUniversalIdentifier: string,
  ) => Partial<Pick<FieldMetadataFormula, 'bindings'>> | null | undefined;
}): boolean => {
  const visitedUniversalIdentifiers = new Set<string>();
  const universalIdentifiersToVisit = Object.values(
    getFieldMetadataFormulaBindings({ formula }) ?? {},
  );

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
      ...Object.values(
        getFieldMetadataFormulaBindings({
          formula: findFormula(readUniversalIdentifier),
        }) ?? {},
      ),
    );
  }

  return false;
};
