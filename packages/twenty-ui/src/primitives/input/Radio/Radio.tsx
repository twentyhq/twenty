import { RadioComponent } from './internal/RadioComponent';
import { RadioIndicator } from './internal/RadioIndicator';
import { RadioRoot } from './internal/RadioRoot';

export const Radio = Object.assign(RadioComponent, {
  Root: RadioRoot,
  Indicator: RadioIndicator,
});
