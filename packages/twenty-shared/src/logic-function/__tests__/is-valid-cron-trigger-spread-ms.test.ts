import { isValidCronTriggerSpreadMs } from '@/logic-function/is-valid-cron-trigger-spread-ms';

describe('isValidCronTriggerSpreadMs', () => {
  it.each([2 * 60_000, 15 * 60_000, 24 * 60 * 60_000])(
    'accepts %s',
    (spreadMs) => {
      expect(isValidCronTriggerSpreadMs(spreadMs)).toBe(true);
    },
  );

  it.each([
    undefined,
    '600000',
    0,
    2 * 60_000 - 1,
    24 * 60 * 60_000 + 1,
    150_000.5,
  ])('rejects %s', (spreadMs) => {
    expect(isValidCronTriggerSpreadMs(spreadMs)).toBe(false);
  });
});
