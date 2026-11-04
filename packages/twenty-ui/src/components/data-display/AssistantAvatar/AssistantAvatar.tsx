import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { themeCssVariables } from '@ui/theme/themeCssVariables';

import styles from './AssistantAvatar.module.scss';
import { type AssistantAvatarProps } from './types/AssistantAvatarProps';

export const AssistantAvatar = ({
  shape = 'circle',
  color = 'blue',
  face = 'default',
  size = 24,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-hidden': ariaHidden,
  ...props
}: AssistantAvatarProps) => {
  const hasAccessibleName =
    isNonEmptyString(ariaLabel) || isNonEmptyString(ariaLabelledBy);
  const usesBrightPalette = color === 'sky' || color === 'yellow';
  const faceShade = usesBrightPalette ? 11 : 10;
  const avatarStyle: CSSProperties &
    Record<`--assistant-avatar-${string}`, string> = {
    '--assistant-avatar-body-color': themeCssVariables.color[`${color}4`],
    '--assistant-avatar-face-color':
      themeCssVariables.color[`${color}${faceShade}`],
    width: size,
    height: size,
    ...style,
  };

  return (
    <span
      {...props}
      className={clsx(styles.root, className)}
      style={avatarStyle}
      data-shape={shape}
      data-color={color}
      data-face={face}
      data-size={size}
      role={hasAccessibleName ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={ariaHidden ?? (hasAccessibleName ? undefined : true)}
    >
      <span aria-hidden="true" className={styles.body} />
      <span aria-hidden="true" className={styles.face} />
    </span>
  );
};
