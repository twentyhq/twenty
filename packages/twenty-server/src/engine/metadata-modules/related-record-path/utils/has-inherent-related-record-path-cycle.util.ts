/* @license Enterprise */

export type InherentRelatedRecordPathEdge = {
  sourceObjectMetadataUniversalIdentifier: string;
  targetObjectMetadataUniversalIdentifier: string;
};

export const hasInherentRelatedRecordPathCycle = ({
  inherentRelatedRecordPathEdges,
}: {
  inherentRelatedRecordPathEdges: InherentRelatedRecordPathEdge[];
}): boolean => {
  const targetsBySource = new Map<string, string[]>();

  for (const {
    sourceObjectMetadataUniversalIdentifier,
    targetObjectMetadataUniversalIdentifier,
  } of inherentRelatedRecordPathEdges) {
    targetsBySource.set(sourceObjectMetadataUniversalIdentifier, [
      ...(targetsBySource.get(sourceObjectMetadataUniversalIdentifier) ?? []),
      targetObjectMetadataUniversalIdentifier,
    ]);
  }

  const visitedObjects = new Set<string>();
  const objectsBeingVisited = new Set<string>();

  const isOnCycle = (objectMetadataUniversalIdentifier: string): boolean => {
    if (objectsBeingVisited.has(objectMetadataUniversalIdentifier)) {
      return true;
    }

    if (visitedObjects.has(objectMetadataUniversalIdentifier)) {
      return false;
    }

    objectsBeingVisited.add(objectMetadataUniversalIdentifier);

    const hasCycle = (
      targetsBySource.get(objectMetadataUniversalIdentifier) ?? []
    ).some(isOnCycle);

    objectsBeingVisited.delete(objectMetadataUniversalIdentifier);
    visitedObjects.add(objectMetadataUniversalIdentifier);

    return hasCycle;
  };

  return [...targetsBySource.keys()].some(isOnCycle);
};
