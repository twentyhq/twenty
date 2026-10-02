import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { clsx } from 'clsx';
import { isFunction, isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown, IconCircleOff } from '@ui/icon';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import selectStyles from '@ui/primitives/input/Select/Select.module.scss';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './CountrySelect.module.scss';
import { CountrySelectAvailabilityEffect } from './internal/CountrySelectAvailabilityEffect';
import { CountrySelectOptions } from './internal/CountrySelectOptions';
import { getCountrySelectLabelledBy } from './internal/getCountrySelectLabelledBy';
import { type CountrySelectProps } from './types/CountrySelectProps';

export const CountrySelect = ({
  countries,
  value,
  onValueChange,
  label,
  searchLabel = 'Search',
  noCountryLabel = 'No country',
  noResultsLabel = 'No results',
  open: controlledOpen,
  onOpenChange,
  popupProps,
  disabled = false,
  className,
  style,
  render,
  onClick,
  onMouseDown,
  onPointerDown,
  onKeyDown,
  onKeyUp,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CountrySelectProps) => {
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
    hasExternalName ? selectedValueId : undefined,
  ].filter(isNonEmptyString);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isDisabled = disabled || !isNonEmptyArray(countries);
  const requestedOpen = controlledOpen ?? uncontrolledOpen;
  const open = !isDisabled && requestedOpen;
  const [previousOpen, setPreviousOpen] = useState(open);
  const [openingCount, setOpeningCount] = useState(0);

  if (previousOpen !== open) {
    setPreviousOpen(open);

    if (open) {
      setOpeningCount(openingCount + 1);
    }
  }

  const selectedCountry = countries.find((country) => country.value === value);
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && isDisabled) {
      return;
    }

    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <div className={styles.root}>
      <CountrySelectAvailabilityEffect
        disabled={isDisabled}
        open={requestedOpen}
        onOpenChange={handleOpenChange}
      />
      {hasVisibleLabel && (
        <label id={labelId} className={styles.label} htmlFor={triggerId}>
          {label}
        </label>
      )}
      <Dropdown.Root type="picker" open={open} onOpenChange={handleOpenChange}>
        <Dropdown.Trigger
          {...props}
          id={triggerId}
          aria-label={nonEmptyAriaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={
            isNonEmptyArray(describedByIds)
              ? describedByIds.join(' ')
              : undefined
          }
          aria-disabled={isDisabled || undefined}
          data-disabled={isDisabled ? '' : undefined}
          onClick={isDisabled ? undefined : onClick}
          onMouseDown={isDisabled ? undefined : onMouseDown}
          onPointerDown={isDisabled ? undefined : onPointerDown}
          onKeyDown={isDisabled ? undefined : onKeyDown}
          onKeyUp={isDisabled ? undefined : onKeyUp}
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
          <span className={styles.flag} aria-hidden="true">
            {selectedFlag}
          </span>
          <span className={selectStyles.value} id={selectedValueId}>
            <OverflowingTextWithTooltip text={selectedLabel} />
          </span>
          <span className={selectStyles.icon} aria-hidden="true">
            <IconChevronDown />
          </span>
        </Dropdown.Trigger>
        <Dropdown.Content
          {...popupProps}
          aria-label={nonEmptyAriaLabel}
          aria-labelledby={labelledBy}
        >
          <CountrySelectOptions
            key={openingCount}
            countries={countries}
            value={value}
            onValueChange={onValueChange}
            searchLabel={searchLabel}
            noCountryLabel={noCountryLabel}
            noResultsLabel={noResultsLabel}
          />
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
};
