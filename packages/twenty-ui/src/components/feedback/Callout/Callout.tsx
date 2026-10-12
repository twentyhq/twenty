import { CalloutAction } from './internal/CalloutAction';
import { CalloutComponent } from './internal/CalloutComponent';

export const Callout = Object.assign(CalloutComponent, {
  Action: CalloutAction,
});
