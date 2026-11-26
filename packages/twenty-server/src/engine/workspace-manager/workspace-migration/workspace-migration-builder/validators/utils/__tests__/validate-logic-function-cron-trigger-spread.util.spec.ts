import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { validateLogicFunctionCronTriggerSpread } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-logic-function-cron-trigger-spread.util';

describe('validateLogicFunctionCronTriggerSpread', () => {
  it.each([undefined, null])(
    'accepts cron trigger settings that are %s',
    (cronTriggerSettings) => {
      expect(
        validateLogicFunctionCronTriggerSpread({ cronTriggerSettings }),
      ).toEqual([]);
    },
  );

  it.each([undefined, 2 * 60_000, 24 * 60 * 60_000])(
    'accepts a spreadMs of %s',
    (spreadMs) => {
      expect(
        validateLogicFunctionCronTriggerSpread({
          cronTriggerSettings: { pattern: '0 * * * *', spreadMs },
        }),
      ).toEqual([]);
    },
  );

  it.each([0, 60_000, 24 * 60 * 60_000 + 1, 150_000.5])(
    'rejects a spreadMs of %s',
    (spreadMs) => {
      const errors = validateLogicFunctionCronTriggerSpread({
        cronTriggerSettings: { pattern: '0 * * * *', spreadMs },
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe(
        LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      );
    },
  );
});
