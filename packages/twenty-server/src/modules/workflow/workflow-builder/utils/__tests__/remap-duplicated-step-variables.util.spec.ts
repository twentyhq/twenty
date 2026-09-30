import { remapDuplicatedStepVariables } from 'src/modules/workflow/workflow-builder/utils/remap-duplicated-step-variables.util';

const CLONED_STEP_ID_BY_SOURCE_STEP_ID = new Map([['source', 'copy']]);

describe('remapDuplicatedStepVariables', () => {
  it('points references to a duplicated step at its clone', () => {
    expect(
      remapDuplicatedStepVariables(
        'Company {{source.id}} named {{source.name}} ({{source}})',
        CLONED_STEP_ID_BY_SOURCE_STEP_ID,
      ),
    ).toBe('Company {{copy.id}} named {{copy.name}} ({{copy}})');
  });

  it('leaves trigger references, other steps and plain text untouched', () => {
    expect(
      remapDuplicatedStepVariables(
        'source {{trigger.recordId}} {{other.id}} {{sourceStep.id}}',
        CLONED_STEP_ID_BY_SOURCE_STEP_ID,
      ),
    ).toBe('source {{trigger.recordId}} {{other.id}} {{sourceStep.id}}');
  });

  it('remaps nested values and keys without mutating the input', () => {
    const input = {
      values: ['{{source.id}}', null, 3, true],
      record: { '{{source.id}}': '{{source.name}}' },
    };

    expect(
      remapDuplicatedStepVariables(input, CLONED_STEP_ID_BY_SOURCE_STEP_ID),
    ).toEqual({
      values: ['{{copy.id}}', null, 3, true],
      record: { '{{copy.id}}': '{{copy.name}}' },
    });
    expect(input.values[0]).toBe('{{source.id}}');
  });
});
