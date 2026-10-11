import { SwitchComponent } from './internal/SwitchComponent';
import { SwitchRoot } from './internal/SwitchRoot';
import { SwitchThumb } from './internal/SwitchThumb';

export const Switch = Object.assign(SwitchComponent, {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
});
