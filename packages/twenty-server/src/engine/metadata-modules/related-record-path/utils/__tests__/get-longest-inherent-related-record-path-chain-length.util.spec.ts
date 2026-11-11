import { getLongestInherentRelatedRecordPathChainLength } from 'src/engine/metadata-modules/related-record-path/utils/get-longest-inherent-related-record-path-chain-length.util';

const buildEdge = (source: string, target: string) => ({
  sourceObjectMetadataUniversalIdentifier: source,
  targetObjectMetadataUniversalIdentifier: target,
});

describe('getLongestInherentRelatedRecordPathChainLength', () => {
  it('should be zero without any path', () => {
    expect(
      getLongestInherentRelatedRecordPathChainLength({
        inherentRelatedRecordPathEdges: [],
      }),
    ).toBe(0);
  });

  it('should count the paths following one another', () => {
    expect(
      getLongestInherentRelatedRecordPathChainLength({
        inherentRelatedRecordPathEdges: [
          buildEdge('company', 'person'),
          buildEdge('person', 'note'),
          buildEdge('note', 'attachment'),
        ],
      }),
    ).toBe(3);
  });

  it('should keep the longest branch when paths fan out', () => {
    expect(
      getLongestInherentRelatedRecordPathChainLength({
        inherentRelatedRecordPathEdges: [
          buildEdge('company', 'person'),
          buildEdge('company', 'opportunity'),
          buildEdge('opportunity', 'note'),
        ],
      }),
    ).toBe(2);
  });
});
