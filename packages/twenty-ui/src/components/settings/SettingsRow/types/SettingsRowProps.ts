import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type SwitchProps } from '@ui/primitives/input/Switch/types/SwitchProps';

export type SettingsRowProps = Omit<SwitchProps, 'children'> & {
  children: ReactNode;
  startElement?: ReactNode;
  description?: ReactNode;
  focused?: boolean;
  labelRef?: useRender.ComponentProps<'label'>['ref'];
  labelRender?: useRender.ComponentProps<'label'>['render'];
};
