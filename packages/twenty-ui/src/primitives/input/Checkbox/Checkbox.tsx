import { CheckboxComponent } from './internal/CheckboxComponent';
import { CheckboxIndicator } from './internal/CheckboxIndicator';
import { CheckboxRoot } from './internal/CheckboxRoot';

export const Checkbox = Object.assign(CheckboxComponent, {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
});
