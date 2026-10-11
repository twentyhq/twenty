import { type SwitchProps } from '../types/SwitchProps';
import { SwitchRoot } from './SwitchRoot';
import { SwitchThumb } from './SwitchThumb';

export const SwitchComponent = ({ children, ...props }: SwitchProps) => (
  <SwitchRoot {...props}>
    <SwitchThumb />
    {children}
  </SwitchRoot>
);
