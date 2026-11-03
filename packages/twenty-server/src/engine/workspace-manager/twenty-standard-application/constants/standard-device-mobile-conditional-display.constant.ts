import { type ConditionalDisplay } from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';

export const STANDARD_DEVICE_MOBILE_CONDITIONAL_DISPLAY: ConditionalDisplay =
  buildDeviceConditionalDisplay('MOBILE');
