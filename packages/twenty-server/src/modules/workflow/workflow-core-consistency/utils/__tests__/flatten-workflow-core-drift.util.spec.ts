import { flattenWorkflowCoreDrift } from 'src/modules/workflow/workflow-core-consistency/utils/flatten-workflow-core-drift.util';

describe('flattenWorkflowCoreDrift', () => {
  it('should return no entries for a workspace without workflows', () => {
    expect(flattenWorkflowCoreDrift(null)).toEqual([]);
  });

  it('should return no entries when every counter is zero', () => {
    expect(
      flattenWorkflowCoreDrift({
        workflow: {
          unlinked: 0,
          missingCore: 0,
          fieldMismatch: 0,
          orphanCore: 0,
        },
        workflowVersion: {
          unlinked: 0,
          missingCore: 0,
          fieldMismatch: 0,
          orphanCore: 0,
        },
        automatedTrigger: {
          inTableNotCache: 0,
          inCacheNotTable: 0,
          mismatch: 0,
        },
      }),
    ).toEqual([]);
  });

  it('should name every non-zero counter with its entity', () => {
    expect(
      flattenWorkflowCoreDrift({
        workflow: {
          unlinked: 2,
          missingCore: 0,
          fieldMismatch: 0,
          orphanCore: 0,
        },
        workflowVersion: {
          unlinked: 0,
          missingCore: 0,
          fieldMismatch: 1,
          orphanCore: 0,
        },
        automatedTrigger: {
          inTableNotCache: 0,
          inCacheNotTable: 0,
          mismatch: 0,
        },
      }),
    ).toEqual(['workflow.unlinked=2', 'workflowVersion.fieldMismatch=1']);
  });
});
