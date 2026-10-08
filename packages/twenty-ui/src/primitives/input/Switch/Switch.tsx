import { SwitchRoot } from './internal/SwitchRoot';
import { SwitchThumb } from './internal/SwitchThumb';
import { type SwitchProps } from './types/SwitchProps';

export const Switch = Object.assign(
  ({ children, ...props }: SwitchProps) => (
    <SwitchRoot {...props}>
      <SwitchThumb />
      {children}
    </SwitchRoot>
  ),
  { Root: SwitchRoot, Thumb: SwitchThumb },
);
