import { PlansContent } from './PlansContent';
import { Root } from './Root';

// Only Content and Root are part of the section's public compound API. The
// inner toggles and cards (BillingToggle, SelfHostToggle, Card, Cards) are
// composed internally by PlansContent and were never consumed via Plans.*.
export const Plans = {
  Content: PlansContent,
  Root,
};
