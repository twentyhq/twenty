import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type SwitchProps } from '@ui/primitives/input/Switch/types/SwitchProps';

export type SettingsRowProps = Omit<
  useRender.ComponentProps<'label'>,
  'children' | 'htmlFor'
> & {
  children: ReactNode;
  startElement?: ReactNode;
  description?: ReactNode;
  focused?: boolean;
  switchProps?: SwitchProps;
};
