import { WorkflowTriggerException } from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { assertCronPatternIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-cron-pattern-is-valid.util';

describe('assertCronPatternIsValid', () => {
  it.each(['12 * * * *', '0 12 * * * *', '30 9 */2 * *', '0 9 * * 1-5'])(
    'should accept %s',
    (pattern) => {
      expect(() => assertCronPatternIsValid(pattern)).not.toThrow();
    },
  );

  it.each(['60 25 32 13 8', 'every monday'])('should reject %j', (pattern) => {
    expect(() => assertCronPatternIsValid(pattern)).toThrow(
      WorkflowTriggerException,
    );
  });
});
