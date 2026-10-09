import { mergeProps } from '@base-ui/react/merge-props';
import { useId } from 'react';

import { Switch } from '@ui/primitives/input/Switch/Switch';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { SettingsRowLabel } from './internal/SettingsRowLabel';
import { type SettingsRowProps } from './types/SettingsRowProps';

export const SettingsRow = ({
  children,
  startElement,
  description,
  focused = false,
  switchProps = {},
  className,
  style,
  render,
  ref,
  ...labelProps
}: SettingsRowProps) => {
  const generatedSwitchId = useId();
  const { id: switchId = generatedSwitchId, size = 'sm' } = switchProps;
  const labelId = `${generatedSwitchId}-label`;
  const descriptionId = `${generatedSwitchId}-description`;
  const hasDescription = isRenderableSlot(description);
  const hasControlLabel = isDefined(switchProps['aria-label']);

  return (
    <ListItem
      className={className}
      style={style}
      startIcon={startElement}
      focused={focused}
      data-disabled={switchProps.disabled || undefined}
      description={
        hasDescription && <span id={descriptionId}>{description}</span>
      }
      render={(renderProps) => (
        <SettingsRowLabel
          {...mergeProps(renderProps, labelProps)}
          htmlFor={switchId}
          render={render}
          ref={ref}
        />
      )}
      endIcon={
        <Switch
          {...switchProps}
          aria-labelledby={
            switchProps['aria-labelledby'] ?? (hasControlLabel ? '' : labelId)
          }
          aria-describedby={
            switchProps['aria-describedby'] ??
            (hasDescription ? descriptionId : undefined)
          }
          id={switchId}
          size={size}
        />
      }
    >
      <span id={labelId}>{children}</span>
    </ListItem>
  );
};
