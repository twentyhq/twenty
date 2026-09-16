import { type ButtonProps } from './types/ButtonProps';

import { clsx } from 'clsx';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { ButtonHotkeys } from '@ui/primitives/input/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/primitives/input/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/primitives/input/Button/internal/ButtonSoon';
import { useIsMobile } from '@ui/utilities';

import { ButtonText } from '@ui/primitives/input/Button/internal/ButtonText';

import styles from './Button.module.scss';

export const Button = ({
  className,
  Icon,
  title,
  id,
  fullWidth = false,
  variant = 'primary',
  inverted = false,
  size = 'medium',
  accent = 'default',
  position = 'standalone',
  soon = false,
  disabled = false,
  justify = 'flex-start',
  focus: propFocus = false,
  onClick,
  to,
  target,
  dataTestId,
  dataClickOutsideId,
  dataGloballyPreventClickOutside,
  hotkeys,
  ariaLabel,
  'aria-label': nativeAriaLabel,
  ariaExpanded,
  'aria-expanded': nativeAriaExpanded,
  'aria-controls': ariaControls,
  'aria-haspopup': ariaHasPopup,
  'aria-disabled': ariaDisabled,
  'data-base-ui-click-trigger': dataBaseUiClickTrigger,
  'data-popup-open': dataPopupOpen,
  'data-pressed': dataPressed,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onPointerDown,
  onPointerEnter,
  ref,
  role,
  tabIndex,
  style,
  type,
  isLoading = false,
}: ButtonProps) => {
  const isMobile = useIsMobile();

  const [isFocused, setIsFocused] = useState(propFocus);
  const isDisabled = soon || disabled;

  // Replaces the legacy Linaria `as` polymorphism: react-router Link when a
  // `to` is provided, a native button otherwise. Typed as any to forward all
  // props untyped, exactly like the legacy `as` prop did.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ButtonComponent: any = to ? Link : 'button';

  return (
    <div
      className={clsx(
        styles.wrapper,
        isLoading && styles.wrapperLoading,
        fullWidth && styles.fullWidth,
      )}
    >
      <ButtonComponent
        ref={ref}
        id={id}
        role={role}
        tabIndex={tabIndex}
        className={clsx(
          styles.button,
          styles[size],
          fullWidth && styles.fullWidth,
          className,
        )}
        data-variant={variant}
        data-accent={accent}
        data-position={position}
        data-inverted={inverted || undefined}
        data-disabled={isDisabled || undefined}
        data-focus={isFocused || undefined}
        disabled={isDisabled}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        to={to}
        target={target}
        data-testid={dataTestId}
        data-click-outside-id={dataClickOutsideId}
        data-globally-prevent-click-outside={dataGloballyPreventClickOutside}
        data-base-ui-click-trigger={dataBaseUiClickTrigger}
        data-popup-open={dataPopupOpen}
        data-pressed={dataPressed}
        aria-label={ariaLabel ?? nativeAriaLabel}
        aria-expanded={ariaExpanded ?? nativeAriaExpanded}
        aria-controls={ariaControls}
        aria-haspopup={ariaHasPopup}
        aria-disabled={ariaDisabled}
        type={type}
        onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        style={{ ...style, '--btn-justify': justify } as React.CSSProperties}
      >
        {(isLoading || Icon) && (
          <ButtonIcon Icon={Icon} isLoading={!!isLoading} />
        )}
        {isDefined(title) && (
          <ButtonText hasIcon={!!Icon} title={title} isLoading={isLoading} />
        )}
        {hotkeys && !isMobile && (
          <ButtonHotkeys
            hotkeys={hotkeys}
            variant={variant}
            accent={accent}
            size={size}
          />
        )}
        {soon && <ButtonSoon />}
      </ButtonComponent>
    </div>
  );
};
