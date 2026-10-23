import { isDefined } from 'twenty-shared/utils';

import { type UserAllowanceUsage } from 'src/engine/core-modules/usage-limit/types/user-allowance-usage.type';

// A turn spends user credits only while every window has room, so the window with the least left is the one the member sees.
export const selectAiChatUserCreditsUsage = (
  usages: UserAllowanceUsage[],
): UserAllowanceUsage | null => {
  const unknownUsage = usages.find((usage) => !isDefined(usage.consumedValue));

  if (isDefined(unknownUsage)) {
    return unknownUsage;
  }

  const remaining = ({ limitValue, consumedValue }: UserAllowanceUsage) =>
    limitValue - (consumedValue ?? 0);

  return (
    [...usages].sort((left, right) => remaining(left) - remaining(right))[0] ??
    null
  );
};
