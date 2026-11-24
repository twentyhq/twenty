import {
  getFieldMetadataFormulaBindings,
  isDefined,
} from 'twenty-shared/utils';

export const doesFormulaFieldReadItself = ({
  universalIdentifier,
  universalSettings,
  findUniversalSettings,
}: {
  universalIdentifier: string;
  universalSettings: unknown;
  findUniversalSettings: (fieldUniversalIdentifier: string) => unknown;
}): boolean => {
  const visitedUniversalIdentifiers = new Set<string>();
  const universalIdentifiersToVisit = Object.values(
    getFieldMetadataFormulaBindings({ settings: universalSettings }) ?? {},
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
          settings: findUniversalSettings(readUniversalIdentifier),
        }) ?? {},
      ),
    );
  }

  return false;
};
