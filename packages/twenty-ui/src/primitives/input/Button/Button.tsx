import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { clsx } from 'clsx';
import { useContext } from 'react';

import { Loader } from '@ui/primitives/feedback/Loader/Loader';
import { Shortcut } from '@ui/primitives/typography/Shortcut/Shortcut';
import { ButtonGroupContext } from '@ui/primitives/input/ButtonGroup/internal/ButtonGroupContext';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Button.module.scss';
import { type ButtonProps } from './types/ButtonProps';

export const Button = ({
  variant = 'outline',
  color = 'neutral',
  size = 'md',
  fullWidth = false,
  loading = false,
  elevated = false,
  startIcon,
  endIcon,
  shortcut,
  shortcutJoinLabel,
  disabled = false,
  href,
  render,
  className,
  children,
  ...props
}: ButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedVariant = buttonGroup?.variant ?? variant;
  const resolvedColor = buttonGroup?.color ?? color;
  const resolvedSize = buttonGroup?.size ?? size;
  const isLink = isDefined(href);
  const linkProps = isLink ? { href } : undefined;

  return (
    <ButtonPrimitive
      {...props}
      {...linkProps}
      className={mergeClassNames(styles.button, className)}
      data-variant={resolvedVariant}
      data-color={resolvedColor}
      data-size={resolvedSize}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      data-elevated={elevated || undefined}
      aria-busy={loading ? 'true' : props['aria-busy']}
      disabled={disabled || loading}
      role={isLink ? 'link' : undefined}
      nativeButton={!isLink}
      render={render ?? (isLink ? <a href={href}>{children}</a> : undefined)}
    >
      <span className={clsx(styles.content, loading && styles.hidden)}>
        {isDefined(startIcon) && (
          <span className={styles.icon} aria-hidden>
            {startIcon}
          </span>
        )}
        {isDefined(children) && (
          <span className={styles.label}>{children}</span>
        )}
        {isDefined(endIcon) && (
          <span className={styles.icon} aria-hidden>
            {endIcon}
          </span>
        )}
        {isDefined(shortcut) && (
          <Shortcut
            shortcut={shortcut}
            sequenceJoinLabel={shortcutJoinLabel}
            variant="button"
            visibility="desktop"
            aria-hidden
          />
        )}
      </span>
      {loading && (
        <span className={styles.loader} aria-hidden>
          <Loader />
        </span>
      )}
    </ButtonPrimitive>
  );
};
