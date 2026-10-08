import { type NumberField } from '@base-ui/react/number-field';
import { formatNumber } from '@base-ui/utils/formatNumber';

import { NUMBER_STEPPER_FORMAT } from '../constants/NumberStepperFormat';

type IsBlurRoundingOfCurrentValueArgs = {
  nextValue: number | null;
  currentValue: number | null;
  reason: NumberField.Root.ChangeEventReason;
};

export const isBlurRoundingOfCurrentValue = ({
  nextValue,
  currentValue,
  reason,
}: IsBlurRoundingOfCurrentValueArgs) =>
  reason === 'input-blur' &&
  formatNumber(nextValue, undefined, NUMBER_STEPPER_FORMAT) ===
    formatNumber(currentValue, undefined, NUMBER_STEPPER_FORMAT);
