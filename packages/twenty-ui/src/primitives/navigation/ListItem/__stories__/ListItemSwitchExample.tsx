import { useId, useState } from 'react';

import { IconBell } from '@ui/icon';
import { Switch } from '@ui/primitives/input/Switch/Switch';
import { type SwitchProps } from '@ui/primitives/input/Switch/types/SwitchProps';
import { ListItem } from '../ListItem';

type ListItemSwitchExampleProps = {
  disabled?: boolean;
  onCheckedChange?: SwitchProps['onCheckedChange'];
};

export const ListItemSwitchExample = ({
  disabled = false,
  onCheckedChange,
}: ListItemSwitchExampleProps) => {
  const switchId = useId();
  const [checked, setChecked] = useState(false);

  return (
    <ListItem
      render={(renderProps) => <label {...renderProps} htmlFor={switchId} />}
      startIcon={<IconBell aria-hidden />}
      disabled={disabled}
      endIcon={
        <Switch
          id={switchId}
          size="sm"
          disabled={disabled}
          checked={checked}
          onCheckedChange={(nextChecked, eventDetails) => {
            setChecked(nextChecked);
            onCheckedChange?.(nextChecked, eventDetails);
          }}
        />
      }
    >
      Notifications
    </ListItem>
  );
};
