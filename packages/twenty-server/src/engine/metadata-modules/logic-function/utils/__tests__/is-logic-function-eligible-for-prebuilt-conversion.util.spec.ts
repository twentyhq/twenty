import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  isLogicFunctionEligibleForPrebuiltConversion,
  type LogicFunctionPrebuiltConversionFields,
} from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-eligible-for-prebuilt-conversion.util';

const buildFlatLogicFunction = (
  overrides: Partial<LogicFunctionPrebuiltConversionFields> = {},
): LogicFunctionPrebuiltConversionFields => ({
  executionMode: LogicFunctionExecutionMode.LIVE,
  isBuildUpToDate: true,
  checksum: 'checksum-1',
  deletedAt: null,
  ...overrides,
});

describe('isLogicFunctionEligibleForPrebuiltConversion', () => {
  it.each([
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.NPM,
  ])(
    'should be eligible for a built LIVE function on a %s application',
    (applicationSourceType) => {
      expect(
        isLogicFunctionEligibleForPrebuiltConversion({
          flatLogicFunction: buildFlatLogicFunction(),
          applicationSourceType,
        }),
      ).toBe(true);
    },
  );

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])('should not be eligible on a %s application', (applicationSourceType) => {
    expect(
      isLogicFunctionEligibleForPrebuiltConversion({
        flatLogicFunction: buildFlatLogicFunction(),
        applicationSourceType,
      }),
    ).toBe(false);
  });

  it('should not be eligible when the function is already prebuilt', () => {
    expect(
      isLogicFunctionEligibleForPrebuiltConversion({
        flatLogicFunction: buildFlatLogicFunction({
          executionMode: LogicFunctionExecutionMode.PREBUILT,
        }),
        applicationSourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
    ).toBe(false);
  });

  it('should not be eligible when the build is out of date', () => {
    expect(
      isLogicFunctionEligibleForPrebuiltConversion({
        flatLogicFunction: buildFlatLogicFunction({ isBuildUpToDate: false }),
        applicationSourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
    ).toBe(false);
  });

  it.each([null, ''])(
    'should not be eligible when the checksum is %p',
    (checksum) => {
      expect(
        isLogicFunctionEligibleForPrebuiltConversion({
          flatLogicFunction: buildFlatLogicFunction({ checksum }),
          applicationSourceType: ApplicationRegistrationSourceType.TARBALL,
        }),
      ).toBe(false);
    },
  );

  it('should not be eligible when the function is soft deleted', () => {
    expect(
      isLogicFunctionEligibleForPrebuiltConversion({
        flatLogicFunction: buildFlatLogicFunction({
          deletedAt: new Date().toISOString(),
        }),
        applicationSourceType: ApplicationRegistrationSourceType.TARBALL,
      }),
    ).toBe(false);
  });
});
