import { type Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { type SwitchSize } from './SwitchSize';

export type SwitchRootProps = SwitchPrimitive.Root.Props & {
  size?: SwitchSize;
};
