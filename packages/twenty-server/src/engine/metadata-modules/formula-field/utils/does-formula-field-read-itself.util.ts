import {
  isDefined,
  listFieldMetadataFormulaFieldNodes,
} from 'twenty-shared/utils';

const listReadUniversalIdentifiers = (settings: unknown): string[] =>
  listFieldMetadataFormulaFieldNodes({ settings }).flatMap(
    ({ fieldUniversalIdentifier, relationFieldUniversalIdentifier }) =>
      [relationFieldUniversalIdentifier, fieldUniversalIdentifier].filter(
        isDefined,
      ),
  );

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
  const universalIdentifiersToVisit =
    listReadUniversalIdentifiers(universalSettings);

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
      ...listReadUniversalIdentifiers(
        findUniversalSettings(readUniversalIdentifier),
      ),
    );
  }

  return false;
};
