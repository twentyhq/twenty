import { type Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { type SwitchSize } from './SwitchSize';

export type SwitchProps = SwitchPrimitive.Root.Props & {
  size?: SwitchSize;
};
