import { clsx } from 'clsx';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type IconComponent } from '@ui/icon/types/IconComponent';
import { ButtonHotkeys } from '@ui/input/Button/internal/ButtonHotKeys';
import { ButtonIcon } from '@ui/input/Button/internal/ButtonIcon';
import { ButtonSoon } from '@ui/input/Button/internal/ButtonSoon';
import { useIsMobile } from '@ui/utilities';
import { type ClickOutsideAttributes } from '@ui/utilities/types/ClickOutsideAttributes';
import { ButtonText } from '@ui/input/Button/internal/ButtonText';

import styles from './Button.module.scss';

export type ButtonSize = 'medium' | 'small';
export type ButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonAccent = 'default' | 'blue' | 'danger';

export type ButtonProps = {
  id?: string;
  className?: string;
  Icon?: IconComponent;
  title?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  inverted?: boolean;
  size?: ButtonSize;
  position?: ButtonPosition;
  accent?: ButtonAccent;
  soon?: boolean;
  justify?: 'center' | 'flex-start' | 'flex-end';
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  target?: string;
  dataTestId?: string;
  hotkeys?: string[];
  ariaLabel?: string;
  isLoading?: boolean;
} & Pick<React.ComponentProps<'button'>, 'type'> &
  ClickOutsideAttributes;

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
        id={id}
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
        to={to}
        target={target}
        data-testid={dataTestId}
        data-click-outside-id={dataClickOutsideId}
        data-globally-prevent-click-outside={dataGloballyPreventClickOutside}
        aria-label={ariaLabel}
        type={type}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ '--btn-justify': justify } as React.CSSProperties}
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
