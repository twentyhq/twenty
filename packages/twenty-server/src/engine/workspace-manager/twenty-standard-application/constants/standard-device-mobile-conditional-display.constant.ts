import {
  type ConditionalDisplay,
  type ConditionalDisplayDevice,
  ViewFilterOperand,
} from 'twenty-shared/types';

const MOBILE_DEVICES: ConditionalDisplayDevice[] = ['MOBILE'];

export const STANDARD_DEVICE_MOBILE_CONDITIONAL_DISPLAY: ConditionalDisplay = {
  recordFilters: [
    {
      id: '0',
      contextKey: 'device',
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(MOBILE_DEVICES),
    },
  ],
};
