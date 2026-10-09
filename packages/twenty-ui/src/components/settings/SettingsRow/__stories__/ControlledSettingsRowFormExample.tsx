import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { SettingsRow } from '../SettingsRow';
import { type SettingsRowProps } from '../types/SettingsRowProps';

export const ControlledSettingsRowFormExample = ({
  defaultChecked = false,
  onCheckedChange,
  ...props
}: SettingsRowProps) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <form
      aria-label="Notification preferences"
      onReset={() => setChecked(defaultChecked)}
    >
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
      <Button type="reset">Reset</Button>
    </form>
  );
};
