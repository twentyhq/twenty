import { computeCronPatternFromWorkflowCronSchedule } from '@/workflow/utils/computeCronPatternFromWorkflowCronSchedule';

describe('computeCronPatternFromWorkflowCronSchedule', () => {
  it('runs every N days at the chosen time', () => {
    expect(
      computeCronPatternFromWorkflowCronSchedule({
        type: 'DAYS',
        schedule: { day: 2, hour: 9, minute: 30 },
      }),
    ).toBe('30 9 */2 * *');
  });

  it('runs every N hours at the chosen minute', () => {
    expect(
      computeCronPatternFromWorkflowCronSchedule({
        type: 'HOURS',
        schedule: { hour: 3, minute: 15 },
      }),
    ).toBe('15 */3 * * *');
  });

  it('runs every N minutes', () => {
    expect(
      computeCronPatternFromWorkflowCronSchedule({
        type: 'MINUTES',
        schedule: { minute: 10 },
      }),
    ).toBe('*/10 * * * *');
  });

  it('keeps a custom pattern as written', () => {
    expect(
      computeCronPatternFromWorkflowCronSchedule({
        type: 'CUSTOM',
        pattern: '0 9 * * 1',
      }),
    ).toBe('0 9 * * 1');
  });

  it('returns null for an unknown schedule type', () => {
    expect(
      computeCronPatternFromWorkflowCronSchedule({
        type: 'WEEKS',
      } as never),
    ).toBeNull();
  });
});
