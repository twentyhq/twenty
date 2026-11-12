/* @license Enterprise */

import { type InherentRelatedRecordPathEdge } from 'src/engine/metadata-modules/related-record-path/utils/has-inherent-related-record-path-cycle.util';

type ChainEnd = keyof InherentRelatedRecordPathEdge;

// Expects edges without a cycle
export const getInherentRelatedRecordPathChainLengthThroughPath = ({
  inherentRelatedRecordPathEdges,
  inherentRelatedRecordPathEdge,
}: {
  inherentRelatedRecordPathEdges: InherentRelatedRecordPathEdge[];
  inherentRelatedRecordPathEdge: InherentRelatedRecordPathEdge;
}): number => {
  const getChainLength = ({
    objectMetadataUniversalIdentifier,
    nearEnd,
    farEnd,
  }: {
    objectMetadataUniversalIdentifier: string;
    nearEnd: ChainEnd;
    farEnd: ChainEnd;
  }): number =>
    Math.max(
      0,
      ...inherentRelatedRecordPathEdges
        .filter((edge) => edge[nearEnd] === objectMetadataUniversalIdentifier)
        .map(
          (edge) =>
            1 +
            getChainLength({
              objectMetadataUniversalIdentifier: edge[farEnd],
              nearEnd,
              farEnd,
            }),
        ),
    );

  return (
    getChainLength({
      objectMetadataUniversalIdentifier:
        inherentRelatedRecordPathEdge.sourceObjectMetadataUniversalIdentifier,
      nearEnd: 'targetObjectMetadataUniversalIdentifier',
      farEnd: 'sourceObjectMetadataUniversalIdentifier',
    }) +
    1 +
    getChainLength({
      objectMetadataUniversalIdentifier:
        inherentRelatedRecordPathEdge.targetObjectMetadataUniversalIdentifier,
      nearEnd: 'sourceObjectMetadataUniversalIdentifier',
      farEnd: 'targetObjectMetadataUniversalIdentifier',
    })
  );
};
