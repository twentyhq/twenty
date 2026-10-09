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
        onCheckedChange?.(nextChecked, eventDetails);

        if (eventDetails.isCanceled) {
          return;
        }

        setChecked(nextChecked);
      }}
    />
  );
};
