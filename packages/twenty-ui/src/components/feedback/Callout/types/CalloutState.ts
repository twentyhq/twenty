import { type CalloutColor } from './CalloutColor';
import { type CalloutStatus } from './CalloutStatus';
import { type CalloutVariant } from './CalloutVariant';

export type CalloutState = {
  status: CalloutStatus;
  variant: CalloutVariant;
  color: CalloutColor;
};
