import {
  type ConditionalDisplay,
  type ConditionalDisplayDevice,
  ViewFilterOperand,
} from 'twenty-shared/types';

const DESKTOP_DEVICES: ConditionalDisplayDevice[] = ['DESKTOP'];

export const STANDARD_DEVICE_DESKTOP_CONDITIONAL_DISPLAY: ConditionalDisplay = {
  recordFilters: [
    {
      id: '0',
      contextKey: 'device',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(DESKTOP_DEVICES),
    },
  ],
};
