import { hasInherentRelatedRecordPathCycle } from 'src/engine/metadata-modules/related-record-path/utils/has-inherent-related-record-path-cycle.util';

const buildEdge = (source: string, target: string) => ({
  sourceObjectMetadataUniversalIdentifier: source,
  targetObjectMetadataUniversalIdentifier: target,
});

describe('hasInherentRelatedRecordPathCycle', () => {
  it('accepts paths that chain without coming back', () => {
    expect(
      hasInherentRelatedRecordPathCycle({
        inherentRelatedRecordPathEdges: [
          buildEdge('opportunity', 'company'),
          buildEdge('company', 'attachment'),
          buildEdge('person', 'attachment'),
        ],
      }),
    ).toBe(false);
  });

  it('rejects two paths pointing at each other', () => {
    expect(
      hasInherentRelatedRecordPathCycle({
        inherentRelatedRecordPathEdges: [
          buildEdge('company', 'opportunity'),
          buildEdge('opportunity', 'company'),
        ],
      }),
    ).toBe(true);
  });

  it('rejects a longer loop', () => {
    expect(
      hasInherentRelatedRecordPathCycle({
        inherentRelatedRecordPathEdges: [
          buildEdge('company', 'opportunity'),
          buildEdge('opportunity', 'note'),
          buildEdge('note', 'company'),
        ],
      }),
    ).toBe(true);
  });
});
