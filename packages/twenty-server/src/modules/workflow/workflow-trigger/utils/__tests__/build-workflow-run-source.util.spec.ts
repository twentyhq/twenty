import { FieldActorSource } from 'twenty-shared/types';

import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';

describe('buildWorkflowRunSource', () => {
  it('should name the run after the workflow', () => {
    expect(buildWorkflowRunSource('Send invoice')).toEqual({
      source: FieldActorSource.WORKFLOW,
      name: 'Send invoice',
      context: {},
      workspaceMemberId: null,
    });
  });

  it('should trim the name it uses', () => {
    expect(buildWorkflowRunSource('  Send invoice  ').name).toBe(
      'Send invoice',
    );
  });

  it('should fall back to the default name when there is none', () => {
    for (const workflowName of [null, undefined, '', '   ']) {
      expect(buildWorkflowRunSource(workflowName).name).toBe('Workflow');
    }
  });
});
