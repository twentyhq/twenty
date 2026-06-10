import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';
import { type ThemeColor } from '@ui/theme';
import { ThemeContext, themeCssVariables } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import styles from './Tag.module.scss';

type TagWeight = 'regular' | 'medium';
type TagVariant = 'solid' | 'outline' | 'border';
export type TagColor = ThemeColor | 'transparent';

type TagProps = {
  className?: string;
  color: TagColor;
  text: string;
  Icon?: IconComponent;
  onClick?: () => void;
  weight?: TagWeight;
  variant?: TagVariant;
  preventShrink?: boolean;
  preventPadding?: boolean;
};

export const Tag = ({
  className,
  color,
  text,
  Icon,
  onClick,
  weight = 'regular',
  variant = 'solid',
  preventShrink,
  preventPadding,
}: TagProps) => {
  const { theme } = useContext(ThemeContext);

  const tagBackground =
    color === 'transparent'
      ? 'transparent'
      : (themeCssVariables.tag.background[color] ??
        themeCssVariables.tag.background.gray);

  const tagText =
    color === 'transparent'
      ? themeCssVariables.font.color.secondary
      : (themeCssVariables.tag.text[color] ??
        themeCssVariables.font.color.secondary);

  return (
    <span
      className={clsx(
        styles.tag,
        weight === 'medium' && styles.weightMedium,
        variant === 'outline' && styles.variantOutline,
        variant === 'border' && styles.variantBorder,
        preventShrink && styles.preventShrink,
        preventPadding && styles.preventPadding,
        className,
      )}
      onClick={onClick}
      style={
        {
          '--tag-background': tagBackground,
          '--tag-text': tagText,
        } as React.CSSProperties
      }
    >
      {isDefined(Icon) ? (
        <div className={styles.iconContainer}>
          <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </div>
      ) : (
        <></>
      )}
      {preventShrink ? (
        <span className={styles.nonShrinkableText}>{text}</span>
      ) : (
        <span className={styles.content}>
          <OverflowingTextWithTooltip text={text} />
        </span>
      )}
    </span>
  );
};
