import { clsx } from 'clsx';
import { type MotionProps, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Pill } from '@ui/data-display/Pill/Pill';
import { themeCssVariables, useTheme } from '@ui/theme-constants';
import { GRAY_SCALE_LIGHT } from '@ui/theme/constants/GrayScaleLight';
import { useIsMobile } from '@ui/utilities';
import { getOsShortcutSeparator } from '@ui/utilities/device/getOsShortcutSeparator';
import {
  type ButtonAccent,
  type ButtonPosition,
  type ButtonProps,
  type ButtonVariant,
} from '@ui/input/Button/Button';

import styles from './AnimatedButton.module.scss';

export type AnimatedButtonProps = ButtonProps &
  Pick<MotionProps, 'animate' | 'transition'> & {
    animatedSvg: React.ReactNode;
    soonLabel?: string;
    // Renders a square icon-only button (width matches the size-based height).
    square?: boolean;
  };

type AnimatedButtonDynamicStyles = {
  background: string;
  borderColor: string;
  borderWidthOverride: string;
  boxShadow: string;
  color: string;
  hoverBackground: string;
  activeBackground: string;
};

const computeAnimatedButtonDynamicStyles = (
  variant: ButtonVariant,
  inverted: boolean,
  accent: ButtonAccent,
  disabled: boolean,
  focus: boolean,
  position: ButtonPosition,
): AnimatedButtonDynamicStyles => {
  const result: AnimatedButtonDynamicStyles = {
    background: 'transparent',
    borderColor: 'transparent',
    borderWidthOverride: '',
    boxShadow: 'none',
    color: themeCssVariables.font.color.secondary,
    hoverBackground: 'transparent',
    activeBackground: 'transparent',
  };

  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          result.background = !inverted
            ? themeCssVariables.background.secondary
            : themeCssVariables.background.primary;
          result.borderColor = !inverted
            ? !disabled && focus
              ? themeCssVariables.color.blue
              : themeCssVariables.background.transparent.light
            : themeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.secondary;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeCssVariables.background.tertiary
              : themeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? themeCssVariables.background.quaternary
              : themeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'blue':
          result.background = !inverted
            ? themeCssVariables.color.blue
            : themeCssVariables.background.primary;
          result.borderColor = !inverted
            ? focus
              ? themeCssVariables.color.blue
              : themeCssVariables.background.transparent.light
            : themeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? GRAY_SCALE_LIGHT.gray1
            : themeCssVariables.color.blue;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeCssVariables.color.blue10
              : themeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? themeCssVariables.color.blue12
              : themeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
        case 'danger':
          result.background = !inverted
            ? themeCssVariables.color.red
            : themeCssVariables.background.primary;
          result.borderColor = !inverted
            ? focus
              ? themeCssVariables.color.red
              : themeCssVariables.background.transparent.light
            : themeCssVariables.background.transparent.light;
          result.borderWidthOverride = '1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.color.red3
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? themeCssVariables.background.primary
            : themeCssVariables.color.red;
          if (!disabled) {
            result.hoverBackground = !inverted
              ? themeCssVariables.color.red8
              : themeCssVariables.background.secondary;
            result.activeBackground = !inverted
              ? themeCssVariables.color.red10
              : themeCssVariables.background.tertiary;
          } else {
            result.hoverBackground = result.background;
            result.activeBackground = result.background;
          }
          break;
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? !disabled && focus
                ? themeCssVariables.color.blue
                : themeCssVariables.background.transparent.medium
              : focus
                ? themeCssVariables.color.blue
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? GRAY_SCALE_LIGHT.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.transparent.light
              : 'transparent'
            : themeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.transparent.light
              : 'transparent'
            : themeCssVariables.background.transparent.medium;
          break;
        case 'blue':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? themeCssVariables.color.blue
                : themeCssVariables.accent.primary
              : focus
                ? themeCssVariables.color.blue
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? GRAY_SCALE_LIGHT.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.accent.tertiary
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? !disabled
              ? themeCssVariables.color.blue
              : themeCssVariables.accent.accent4060
            : themeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeCssVariables.accent.tertiary
              : 'transparent'
            : themeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeCssVariables.accent.secondary
              : 'transparent'
            : themeCssVariables.background.transparent.medium;
          break;
        case 'danger':
          result.background = 'transparent';
          result.borderColor = !inverted
            ? variant === 'secondary'
              ? focus
                ? themeCssVariables.color.red
                : themeCssVariables.border.color.danger
              : focus
                ? themeCssVariables.color.red
                : 'transparent'
            : variant === 'secondary'
              ? focus || disabled
                ? GRAY_SCALE_LIGHT.gray1
                : themeCssVariables.background.transparent.primary
              : focus
                ? GRAY_SCALE_LIGHT.gray1
                : 'transparent';
          result.borderWidthOverride = '1px 1px 1px 1px';
          result.boxShadow =
            !disabled && focus
              ? `0 0 0 3px ${
                  !inverted
                    ? themeCssVariables.color.red3
                    : themeCssVariables.background.transparent.medium
                }`
              : 'none';
          result.color = !inverted
            ? themeCssVariables.font.color.danger
            : themeCssVariables.font.color.inverted;
          result.hoverBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.danger
              : 'transparent'
            : themeCssVariables.background.transparent.light;
          result.activeBackground = !inverted
            ? !disabled
              ? themeCssVariables.background.danger
              : 'transparent'
            : themeCssVariables.background.transparent.medium;
          break;
      }
      break;
  }

  if (result.borderWidthOverride !== '' && position !== 'standalone') {
    switch (position) {
      case 'left':
        result.borderWidthOverride = '1px 0px 1px 1px';
        break;
      case 'middle':
        result.borderWidthOverride = '1px 0px 1px 0px';
        break;
      case 'right':
        result.borderWidthOverride = '1px 1px 1px 0px';
        break;
    }
  }

  return result;
};

export const AnimatedButton = ({
  className,
  Icon,
  animatedSvg,
  title,
  fullWidth = false,
  variant = 'primary',
  inverted = false,
  size = 'medium',
  accent = 'default',
  square = false,
  position = 'standalone',
  soon = false,
  disabled = false,
  justify = 'flex-start',
  focus = false,
  onClick,
  to,
  target,
  dataTestId,
  hotkeys,
  ariaLabel,
  animate,
  transition,
  dataClickOutsideId,
  dataGloballyPreventClickOutside,
  soonLabel = 'Soon',
}: AnimatedButtonProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isDisabled = soon || disabled;

  const dynamicStyles = useMemo(() => {
    const computedStyles = computeAnimatedButtonDynamicStyles(
      variant,
      inverted,
      accent,
      isDisabled,
      focus,
      position,
    );
    return {
      '--abtn-bg': computedStyles.background,
      '--abtn-border-color': computedStyles.borderColor,
      '--abtn-border-width': computedStyles.borderWidthOverride || undefined,
      '--abtn-box-shadow': computedStyles.boxShadow,
      '--abtn-color': computedStyles.color,
      '--abtn-hover-bg': computedStyles.hoverBackground,
      '--abtn-active-bg': computedStyles.activeBackground,
    } as React.CSSProperties;
  }, [variant, inverted, accent, isDisabled, focus, position]);

  // Replaces the legacy Linaria `as` polymorphism: react-router Link when a
  // `to` is provided, a native button otherwise. Typed as any to forward all
  // props untyped, exactly like the legacy `as` prop did.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ButtonComponent: any = to ? Link : 'button';

  return (
    <ButtonComponent
      className={clsx(
        styles.button,
        styles[size],
        square && styles.square,
        fullWidth && styles.fullWidth,
        className,
      )}
      data-position={position}
      data-disabled={isDisabled || undefined}
      disabled={isDisabled}
      style={
        {
          ...dynamicStyles,
          '--abtn-justify': justify,
        } as React.CSSProperties
      }
      onClick={onClick}
      to={to}
      target={target}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      data-click-outside-id={dataClickOutsideId}
      data-globally-prevent-click-outside={dataGloballyPreventClickOutside}
    >
      {Icon && (
        <motion.div
          className={styles.motion}
          animate={animate}
          transition={transition}
        >
          <Icon size={theme.icon.size.sm} aria-hidden />
        </motion.div>
      )}
      {animatedSvg && (
        <motion.div
          className={styles.motion}
          animate={animate}
          transition={transition}
        >
          {animatedSvg}
        </motion.div>
      )}
      {title}
      {hotkeys && !isMobile && (
        <>
          <div
            className={styles.separator}
            data-size={size}
            data-accent={accent}
          />
          <div
            className={styles.shortcutLabel}
            data-variant={variant}
            data-accent={accent}
          >
            {hotkeys.join(getOsShortcutSeparator())}
          </div>
        </>
      )}
      {soon && (
        <span className={styles.soonPillContainer}>
          <Pill label={soonLabel} />
        </span>
      )}
    </ButtonComponent>
  );
};
