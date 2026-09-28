import { remapDuplicatedStepVariables } from 'src/modules/workflow/workflow-builder/utils/remap-duplicated-step-variables.util';

describe('remapDuplicatedStepVariables', () => {
  it('rewrites nested input references while preserving literals and trigger references', () => {
    const input = {
      message: 'Company {{source.id}}: {{ source.name }}',
      values: ['{{source}}', '{{trigger.recordId}}', null, 3],
      record: { '{{source.id}}': '{{other.id}}' },
      literal: 'source',
    };

    expect(
      remapDuplicatedStepVariables(input, new Map([['source', 'copy']])),
    ).toEqual({
      message: 'Company {{copy.id}}: {{ copy.name }}',
      values: ['{{copy}}', '{{trigger.recordId}}', null, 3],
      record: { '{{copy.id}}': '{{other.id}}' },
      literal: 'source',
    });
    expect(input.message).toBe('Company {{source.id}}: {{ source.name }}');
  });
});
