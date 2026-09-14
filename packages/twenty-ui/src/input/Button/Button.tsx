import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { clsx } from 'clsx';

import { Loader } from '@ui/feedback/Loader/Loader';
import { ButtonHotkeys } from '@ui/input/Button/internal/ButtonHotKeys';
import { ButtonSoon } from '@ui/input/Button/internal/ButtonSoon';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { useIsMobile } from '@ui/utilities';
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
  hotkeys,
  soon = false,
  soonLabel,
  disabled = false,
  href,
  render,
  nativeButton,
  className,
  children,
  ...props
}: ButtonProps) => {
  const isMobile = useIsMobile();
  const isNativeButton = nativeButton ?? !isDefined(href);

  return (
    <ButtonPrimitive
      {...props}
      className={mergeClassNames(styles.button, className)}
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      data-elevated={elevated || undefined}
      aria-busy={loading || props['aria-busy']}
      disabled={disabled || soon || loading}
      role={
        props.role ??
        (isNativeButton ? undefined : isDefined(href) ? 'link' : 'button')
      }
      nativeButton={isNativeButton}
      render={
        render ?? (isDefined(href) ? <a href={href}>{children}</a> : undefined)
      }
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
        {isDefined(hotkeys) && !isMobile && <ButtonHotkeys hotkeys={hotkeys} />}
        {soon && <ButtonSoon label={soonLabel} />}
      </span>
      {loading && (
        <span className={styles.loader} aria-hidden>
          <Loader />
        </span>
      )}
    </ButtonPrimitive>
  );
};
