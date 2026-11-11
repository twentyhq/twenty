/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type InherentRelatedRecordPathEdge } from 'src/engine/metadata-modules/related-record-path/utils/has-inherent-related-record-path-cycle.util';

// Expects edges without a cycle
export const getLongestInherentRelatedRecordPathChainLength = ({
  inherentRelatedRecordPathEdges,
}: {
  inherentRelatedRecordPathEdges: InherentRelatedRecordPathEdge[];
}): number => {
  const chainLengthBySource = new Map<string, number>();

  const getChainLengthFrom = (
    objectMetadataUniversalIdentifier: string,
  ): number => {
    const knownChainLength = chainLengthBySource.get(
      objectMetadataUniversalIdentifier,
    );

    if (isDefined(knownChainLength)) {
      return knownChainLength;
    }

    const chainLength = Math.max(
      0,
      ...inherentRelatedRecordPathEdges
        .filter(
          ({ sourceObjectMetadataUniversalIdentifier }) =>
            sourceObjectMetadataUniversalIdentifier ===
            objectMetadataUniversalIdentifier,
        )
        .map(
          ({ targetObjectMetadataUniversalIdentifier }) =>
            1 + getChainLengthFrom(targetObjectMetadataUniversalIdentifier),
        ),
    );

    chainLengthBySource.set(objectMetadataUniversalIdentifier, chainLength);

    return chainLength;
  };

  return Math.max(
    0,
    ...inherentRelatedRecordPathEdges.map(
      ({ sourceObjectMetadataUniversalIdentifier }) =>
        getChainLengthFrom(sourceObjectMetadataUniversalIdentifier),
    ),
  );
};
