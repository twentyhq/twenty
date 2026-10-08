import { useState } from 'react';

import { SettingsRow } from '../SettingsRow';
import { type SettingsRowProps } from '../types/SettingsRowProps';

export const ControlledSettingsRowExample = ({
  defaultChecked = false,
  onCheckedChange,
  ...props
}: SettingsRowProps) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <SettingsRow
      {...props}
      checked={checked}
      onCheckedChange={(nextChecked, eventDetails) => {
        setChecked(nextChecked);
        onCheckedChange?.(nextChecked, eventDetails);
      }}
    />
  );
};
