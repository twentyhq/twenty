import {
  findRelatedRecordPathChainError,
  type RelatedRecordPathEdge,
} from 'src/engine/metadata-modules/related-record-path/utils/find-related-record-path-chain-error.util';

const buildEdge = ({
  source,
  target,
  hopCount = 1,
  isInherent = true,
}: {
  source: string;
  target: string;
  hopCount?: number;
  isInherent?: boolean;
}): RelatedRecordPathEdge => ({
  sourceObjectMetadataUniversalIdentifier: source,
  targetObjectMetadataUniversalIdentifier: target,
  hopCount,
  isInherent,
});

describe('findRelatedRecordPathChainError', () => {
  it('accepts paths that do not chain', () => {
    expect(
      findRelatedRecordPathChainError({
        relatedRecordPathEdges: [
          buildEdge({ source: 'company', target: 'attachment' }),
          buildEdge({ source: 'person', target: 'attachment' }),
        ],
      }),
    ).toBeUndefined();
  });

  it('rejects a cycle of inherent paths', () => {
    expect(
      findRelatedRecordPathChainError({
        relatedRecordPathEdges: [
          buildEdge({ source: 'company', target: 'opportunity' }),
          buildEdge({ source: 'opportunity', target: 'company' }),
        ],
      }),
    ).toBe('CYCLE');
  });

  it('accepts a loop closed by a non-inherent path', () => {
    expect(
      findRelatedRecordPathChainError({
        relatedRecordPathEdges: [
          buildEdge({ source: 'company', target: 'opportunity' }),
          buildEdge({
            source: 'opportunity',
            target: 'company',
            isInherent: false,
          }),
        ],
      }),
    ).toBeUndefined();
  });

  it('accepts a chain of exactly five relations', () => {
    expect(
      findRelatedRecordPathChainError({
        relatedRecordPathEdges: [
          buildEdge({
            source: 'opportunity',
            target: 'company',
            hopCount: 3,
            isInherent: false,
          }),
          buildEdge({ source: 'company', target: 'note', hopCount: 2 }),
        ],
      }),
    ).toBeUndefined();
  });

  it('rejects a chain of more than five relations', () => {
    expect(
      findRelatedRecordPathChainError({
        relatedRecordPathEdges: [
          buildEdge({
            source: 'opportunity',
            target: 'company',
            hopCount: 3,
            isInherent: false,
          }),
          buildEdge({ source: 'company', target: 'note', hopCount: 2 }),
          buildEdge({ source: 'note', target: 'attachment' }),
        ],
      }),
    ).toBe('TOO_MANY_HOPS');
  });
});
