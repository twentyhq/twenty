import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { themeCssVariables } from '@ui/theme/themeCssVariables';

import styles from './AssistantAvatar.module.scss';
import { AnimatedAssistantAvatarFace } from './internal/components/AnimatedAssistantAvatarFace';
import { ASSISTANT_AVATAR_BODY_ASSET_BY_SHAPE } from './internal/constants/assistantAvatarBodyAssetByShape.constant';
import { ASSISTANT_AVATAR_FACE_ASSET_BY_FACE } from './internal/constants/assistantAvatarFaceAssetByFace.constant';
import { type AssistantAvatarProps } from './types/AssistantAvatarProps';

export const AssistantAvatar = ({
  shape = 'circle',
  color = 'blue',
  face = 'default',
  size = 24,
  isAnimated = false,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-hidden': ariaHidden,
  ...props
}: AssistantAvatarProps) => {
  const hasAccessibleName =
    isNonEmptyString(ariaLabel) || isNonEmptyString(ariaLabelledBy);
  const isBrightPalette = color === 'sky' || color === 'yellow';
  const faceShade = isBrightPalette ? 11 : 10;
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
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={clsx(styles.root, className)}
      style={avatarStyle}
      data-shape={shape}
      data-color={color}
      data-face={face}
      data-size={size}
      data-animated={isAnimated}
      role={hasAccessibleName ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={ariaHidden ?? (hasAccessibleName ? undefined : true)}
    >
      <span
        aria-hidden="true"
        className={styles.body}
        style={{
          maskImage: `url("${ASSISTANT_AVATAR_BODY_ASSET_BY_SHAPE[shape]}")`,
        }}
      />
      <span
        aria-hidden="true"
        className={styles.face}
        style={{
          maskImage: `url("${ASSISTANT_AVATAR_FACE_ASSET_BY_FACE[face]}")`,
        }}
      />
      {isAnimated && <AnimatedAssistantAvatarFace key={face} face={face} />}
    </span>
  );
};
