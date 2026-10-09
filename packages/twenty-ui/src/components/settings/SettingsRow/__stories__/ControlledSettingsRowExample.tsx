import { useState } from 'react';

import { SettingsRow } from '../SettingsRow';
import { type SettingsRowProps } from '../types/SettingsRowProps';

export const ControlledSettingsRowExample = ({
  switchProps,
  ...props
}: SettingsRowProps) => {
  const {
    defaultChecked = false,
    onCheckedChange,
    ...controlProps
  } = switchProps ?? {};
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <SettingsRow
      {...props}
      switchProps={{
        ...controlProps,
        checked,
        onCheckedChange: (nextChecked, eventDetails) => {
          onCheckedChange?.(nextChecked, eventDetails);

          if (eventDetails.isCanceled) {
            return;
          }

          setChecked(nextChecked);
        },
      }}
    />
  );
};
