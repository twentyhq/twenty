/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { MAX_RELATED_RECORD_PATH_CHAIN_HOP_COUNT } from 'src/engine/metadata-modules/related-record-path/constants/max-related-record-path-chain-hop-count.constant';

export type RelatedRecordPathEdge = {
  sourceObjectMetadataUniversalIdentifier: string;
  targetObjectMetadataUniversalIdentifier: string;
  hopCount: number;
  isInherent: boolean;
};

export type RelatedRecordPathChainError = 'CYCLE' | 'TOO_MANY_HOPS';

export const findRelatedRecordPathChainError = ({
  relatedRecordPathEdges,
}: {
  relatedRecordPathEdges: RelatedRecordPathEdge[];
}): RelatedRecordPathChainError | undefined => {
  const incomingEdgesByTarget = new Map<string, RelatedRecordPathEdge[]>();

  for (const edge of relatedRecordPathEdges) {
    incomingEdgesByTarget.set(edge.targetObjectMetadataUniversalIdentifier, [
      ...(incomingEdgesByTarget.get(
        edge.targetObjectMetadataUniversalIdentifier,
      ) ?? []),
      edge,
    ]);
  }

  const chainHopCountByObject = new Map<string, number>();
  const objectsBeingVisited = new Set<string>();

  const computeChainHopCount = (
    objectMetadataUniversalIdentifier: string,
  ): number | 'CYCLE' => {
    const knownChainHopCount = chainHopCountByObject.get(
      objectMetadataUniversalIdentifier,
    );

    if (isDefined(knownChainHopCount)) {
      return knownChainHopCount;
    }

    if (objectsBeingVisited.has(objectMetadataUniversalIdentifier)) {
      return 'CYCLE';
    }

    objectsBeingVisited.add(objectMetadataUniversalIdentifier);

    let chainHopCount = 0;

    for (const edge of incomingEdgesByTarget.get(
      objectMetadataUniversalIdentifier,
    ) ?? []) {
      const sourceChainHopCount = edge.isInherent
        ? computeChainHopCount(edge.sourceObjectMetadataUniversalIdentifier)
        : 0;

      if (sourceChainHopCount === 'CYCLE') {
        return 'CYCLE';
      }

      chainHopCount = Math.max(
        chainHopCount,
        edge.hopCount + sourceChainHopCount,
      );
    }

    objectsBeingVisited.delete(objectMetadataUniversalIdentifier);
    chainHopCountByObject.set(objectMetadataUniversalIdentifier, chainHopCount);

    return chainHopCount;
  };

  for (const targetObjectMetadataUniversalIdentifier of incomingEdgesByTarget.keys()) {
    const chainHopCount = computeChainHopCount(
      targetObjectMetadataUniversalIdentifier,
    );

    if (chainHopCount === 'CYCLE') {
      return 'CYCLE';
    }

    if (chainHopCount > MAX_RELATED_RECORD_PATH_CHAIN_HOP_COUNT) {
      return 'TOO_MANY_HOPS';
    }
  }

  return undefined;
};
