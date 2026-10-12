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
  labelRender,
  labelRef,
  ...controlProps
}: SettingsRowProps) => {
  const generatedSwitchId = useId();
  const { id: switchId = generatedSwitchId, size = 'sm' } = controlProps;
  const labelId = `${generatedSwitchId}-label`;
  const descriptionId = `${generatedSwitchId}-description`;
  const hasDescription = isRenderableSlot(description);
  const hasControlLabel = isDefined(controlProps['aria-label']);

  return (
    <ListItem
      startIcon={startElement}
      focused={focused}
      data-disabled={controlProps.disabled || undefined}
      description={
        hasDescription && <span id={descriptionId}>{description}</span>
      }
      render={(renderProps) => (
        <SettingsRowLabel
          {...renderProps}
          htmlFor={switchId}
          render={labelRender}
          ref={labelRef}
        />
      )}
      endIcon={
        <Switch
          {...controlProps}
          aria-labelledby={
            controlProps['aria-labelledby'] ?? (hasControlLabel ? '' : labelId)
          }
          aria-describedby={
            controlProps['aria-describedby'] ??
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
