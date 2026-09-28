import { useId } from 'react';

import { Switch } from '@ui/primitives/input/Switch/Switch';
import { isRenderableSlot } from '@ui/primitives/navigation/ListItem/internal/isRenderableSlot';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';

import { type SettingsRowProps } from './types/SettingsRowProps';

export const SettingsRow = ({
  children,
  startIcon,
  description,
  focused = false,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  readOnly = false,
  size = 'sm',
  name,
  value,
  required,
  className,
  style,
  ref,
  ...labelProps
}: SettingsRowProps) => {
  const switchId = useId();
  const labelId = `${switchId}-label`;
  const descriptionId = `${switchId}-description`;
  const hasDescription = isRenderableSlot(description);

  return (
    <ListItem
      className={className}
      style={style}
      startIcon={startIcon}
      focused={focused}
      disabled={disabled}
      description={
        hasDescription && <span id={descriptionId}>{description}</span>
      }
      render={(renderProps) => (
        <label {...labelProps} {...renderProps} htmlFor={switchId} ref={ref} />
      )}
      endIcon={
        <Switch
          id={switchId}
          aria-labelledby={labelId}
          aria-describedby={hasDescription ? descriptionId : undefined}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          readOnly={readOnly}
          size={size}
          name={name}
          value={value}
          required={required}
        />
      }
    >
      <span id={labelId}>{children}</span>
    </ListItem>
  );
};
