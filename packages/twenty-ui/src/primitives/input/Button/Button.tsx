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
  variant,
  color,
  size,
  fullWidth = false,
  loading = false,
  loadingPosition = 'center',
  elevated = false,
  startIcon,
  endIcon,
  shortcut,
  shortcutJoinLabel,
  disabled = false,
  href,
  render,
  nativeButton,
  role,
  className,
  children,
  ...props
}: ButtonProps) => {
  const buttonGroup = useContext(ButtonGroupContext);
  const resolvedVariant = variant ?? buttonGroup?.variant ?? 'outline';
  const resolvedColor = color ?? buttonGroup?.color ?? 'neutral';
  const resolvedSize = size ?? buttonGroup?.size ?? 'md';
  const isAutomaticLink =
    isDefined(href) && !isDefined(render) && nativeButton !== true;
  const linkProps = isDefined(href) ? { href } : undefined;
  const resolvedRole = role ?? (isAutomaticLink ? 'link' : undefined);
  const roleProps = isDefined(resolvedRole)
    ? { role: resolvedRole }
    : undefined;
  const isCenterLoading = loading && loadingPosition === 'center';
  const resolvedStartIcon =
    loading && loadingPosition === 'start' ? <Loader /> : startIcon;
  const resolvedEndIcon =
    loading && loadingPosition === 'end' ? <Loader /> : endIcon;

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
      {...roleProps}
      nativeButton={nativeButton ?? !isAutomaticLink}
      render={
        render ?? (isAutomaticLink ? <a href={href}>{children}</a> : undefined)
      }
    >
      <span className={clsx(styles.content, isCenterLoading && styles.hidden)}>
        {isDefined(resolvedStartIcon) && (
          <span className={styles.icon} aria-hidden>
            {resolvedStartIcon}
          </span>
        )}
        {isDefined(children) && (
          <span className={styles.label}>{children}</span>
        )}
        {isDefined(resolvedEndIcon) && (
          <span className={styles.icon} aria-hidden>
            {resolvedEndIcon}
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
      {isCenterLoading && (
        <span className={styles.loader} aria-hidden>
          <Loader />
        </span>
      )}
    </ButtonPrimitive>
  );
};
