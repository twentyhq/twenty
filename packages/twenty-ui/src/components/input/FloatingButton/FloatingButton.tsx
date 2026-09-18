import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { clsx } from 'clsx';
import { type FloatingButtonProps } from './types/FloatingButtonProps';

import { useTheme } from '@ui/theme-constants';

import styles from './FloatingButton.module.scss';

export const FloatingButton = ({
  className,
  Icon,
  title,
  ariaLabel,
  size = 'small',
  position = 'standalone',
  applyBlur = true,
  applyShadow = true,
  disabled = false,
  focus = false,
  href,
  render,
  onClick,
}: FloatingButtonProps) => {
  const theme = useTheme();
  const isLink = isDefined(href);
  const linkProps = isLink ? { href } : undefined;

  return (
    <ButtonPrimitive
      {...linkProps}
      disabled={disabled}
      aria-label={ariaLabel}
      className={clsx(styles.button, styles[size], className)}
      data-position={position}
      data-apply-blur={applyBlur || undefined}
      data-apply-shadow={applyShadow || undefined}
      data-disabled={disabled || undefined}
      data-focus={(focus && !disabled) || undefined}
      nativeButton={!isLink}
      role={isLink ? 'link' : undefined}
      render={render ?? (isLink ? <a href={href}>{title}</a> : undefined)}
      onClick={onClick}
    >
      {Icon && <Icon size={theme.icon.size.sm} aria-hidden />}
      {title}
    </ButtonPrimitive>
  );
};
