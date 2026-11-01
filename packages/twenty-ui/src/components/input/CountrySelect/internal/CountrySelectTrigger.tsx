import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { clsx } from 'clsx';
import { isFunction, isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';

import { useDropdownContext } from '@ui/components/navigation/Dropdown/internal/useDropdownContext';
import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown, IconCircleOff } from '@ui/icon';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import selectStyles from '@ui/primitives/input/Select/Select.module.scss';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../CountrySelect.module.scss';
import { CountrySelectAvailabilityEffect } from './CountrySelectAvailabilityEffect';
import { getCountrySelectLabelledBy } from './getCountrySelectLabelledBy';
import { useCountrySelectContextOrThrow } from './useCountrySelectContextOrThrow';
import { type CountrySelectTriggerProps } from '../types/CountrySelectTriggerProps';

const skipTriggerActivation = (event: { preventBaseUIHandler?: () => void }) =>
  event.preventBaseUIHandler?.();

export const CountrySelectTrigger = ({
  label,
  wrapperProps,
  children,
  className,
  style,
  render,
  onClick,
  onMouseDown,
  onPointerDown,
  onKeyDown,
  onKeyUp,
  openOnHover,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CountrySelectTriggerProps) => {
  const {
    selectedCountry,
    disabled: isDisabled,
    noCountryLabel,
  } = useCountrySelectContextOrThrow();
  const { open, setOpen } = useDropdownContext();
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const labelId = `${generatedId}-label`;
  const selectedValueId = `${generatedId}-value`;
  const hasVisibleLabel = isNonEmptyString(label);
  const nonEmptyAriaLabel = isNonEmptyString(ariaLabel) ? ariaLabel : undefined;
  const labelledBy = getCountrySelectLabelledBy({
    ariaLabelledBy,
    ariaLabel: nonEmptyAriaLabel,
    visibleLabelId: hasVisibleLabel ? labelId : undefined,
  });
  const hasExternalName = isDefined(labelledBy) || isDefined(nonEmptyAriaLabel);
  const describedByIds = [
    ariaDescribedBy,
    hasExternalName && !isDefined(children) ? selectedValueId : undefined,
  ].filter(isNonEmptyString);
  const selectedLabel = selectedCountry?.label ?? noCountryLabel;
  const selectedFlag = isDefined(selectedCountry) ? (
    selectedCountry.flag
  ) : (
    <IconCircleOff />
  );

  const getTriggerState = (
    state: PopoverPrimitive.Trigger.State,
  ): PopoverPrimitive.Trigger.State => ({ ...state, disabled: isDisabled });
  const triggerClassName = mergeClassNames<PopoverPrimitive.Trigger.State>(
    clsx(inputStyles.input, inputStyles.md, selectStyles.trigger),
    className,
  );

  return (
    <div
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...wrapperProps}
      className={clsx(styles.root, wrapperProps?.className)}
    >
      <CountrySelectAvailabilityEffect
        disabled={isDisabled}
        open={open}
        onOpenChange={setOpen}
      />
      {hasVisibleLabel && (
        <label id={labelId} className={styles.label} htmlFor={triggerId}>
          {label}
        </label>
      )}
      <Dropdown.Trigger
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...props}
        id={triggerId}
        aria-label={nonEmptyAriaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={
          isNonEmptyArray(describedByIds) ? describedByIds.join(' ') : undefined
        }
        aria-disabled={isDisabled || undefined}
        openOnHover={isDisabled ? false : openOnHover}
        data-disabled={isDisabled ? '' : undefined}
        onClick={isDisabled ? skipTriggerActivation : onClick}
        onMouseDown={isDisabled ? skipTriggerActivation : onMouseDown}
        onPointerDown={isDisabled ? skipTriggerActivation : onPointerDown}
        onKeyDown={isDisabled ? skipTriggerActivation : onKeyDown}
        onKeyUp={isDisabled ? skipTriggerActivation : onKeyUp}
        className={(state) => triggerClassName(getTriggerState(state))}
        style={
          isFunction(style) ? (state) => style(getTriggerState(state)) : style
        }
        render={
          isFunction(render)
            ? (renderProps, state) =>
                render(renderProps, getTriggerState(state))
            : render
        }
      >
        {children ?? (
          <>
            <span className={styles.flag} aria-hidden="true">
              {selectedFlag}
            </span>
            <span className={selectStyles.value} id={selectedValueId}>
              <OverflowingTextWithTooltip text={selectedLabel} />
            </span>
            <span className={selectStyles.icon} aria-hidden="true">
              <IconChevronDown />
            </span>
          </>
        )}
      </Dropdown.Trigger>
    </div>
  );
};
