import { formatNumber } from '@base-ui/utils/formatNumber';

import { type NumberFieldRootChangeEventReason } from '@ui/primitives/input/NumberField/types/NumberFieldRootChangeEventReason';

import { NUMBER_STEPPER_FORMAT } from '../constants/NumberStepperFormat';

type IsBlurRoundingOfCurrentValueArgs = {
  nextValue: number | null;
  currentValue: number | null;
  reason: NumberFieldRootChangeEventReason;
};

export const isBlurRoundingOfCurrentValue = ({
  nextValue,
  currentValue,
  reason,
}: IsBlurRoundingOfCurrentValueArgs) =>
  reason === 'input-blur' &&
  formatNumber(nextValue, undefined, NUMBER_STEPPER_FORMAT) ===
    formatNumber(currentValue, undefined, NUMBER_STEPPER_FORMAT);
