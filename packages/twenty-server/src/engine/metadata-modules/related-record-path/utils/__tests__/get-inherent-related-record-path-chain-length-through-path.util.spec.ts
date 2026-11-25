import { getInherentRelatedRecordPathChainLengthThroughPath } from 'src/engine/metadata-modules/related-record-path/utils/get-inherent-related-record-path-chain-length-through-path.util';

const buildEdge = (source: string, target: string) => ({
  sourceObjectMetadataUniversalIdentifier: source,
  targetObjectMetadataUniversalIdentifier: target,
});

const COMPANY_TO_PERSON = buildEdge('company', 'person');
const PERSON_TO_NOTE = buildEdge('person', 'note');
const NOTE_TO_ATTACHMENT = buildEdge('note', 'attachment');

describe('getInherentRelatedRecordPathChainLengthThroughPath', () => {
  it('should be one for a path no other path follows or precedes', () => {
    expect(
      getInherentRelatedRecordPathChainLengthThroughPath({
        inherentRelatedRecordPathEdges: [COMPANY_TO_PERSON],
        inherentRelatedRecordPathEdge: COMPANY_TO_PERSON,
      }),
    ).toBe(1);
  });

  it('should count the paths before and after the path', () => {
    expect(
      getInherentRelatedRecordPathChainLengthThroughPath({
        inherentRelatedRecordPathEdges: [
          COMPANY_TO_PERSON,
          PERSON_TO_NOTE,
          NOTE_TO_ATTACHMENT,
        ],
        inherentRelatedRecordPathEdge: PERSON_TO_NOTE,
      }),
    ).toBe(3);
  });

  it('should ignore a longer chain the path is not part of', () => {
    const projectToTask = buildEdge('project', 'task');

    expect(
      getInherentRelatedRecordPathChainLengthThroughPath({
        inherentRelatedRecordPathEdges: [
          COMPANY_TO_PERSON,
          PERSON_TO_NOTE,
          NOTE_TO_ATTACHMENT,
          projectToTask,
        ],
        inherentRelatedRecordPathEdge: projectToTask,
      }),
    ).toBe(1);
  });
});
