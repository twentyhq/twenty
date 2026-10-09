import { type SwitchSize } from '@ui/primitives/input/Switch/types/SwitchSize';

import { SettingsRow } from '../SettingsRow';
import { type SettingsRowProps } from '../types/SettingsRowProps';

type SettingsRowCatalogExampleProps = SettingsRowProps & {
  switchSize: SwitchSize;
};

export const SettingsRowCatalogExample = ({
  switchSize,
  switchProps,
  ...props
}: SettingsRowCatalogExampleProps) => (
  <SettingsRow {...props} switchProps={{ ...switchProps, size: switchSize }} />
);
