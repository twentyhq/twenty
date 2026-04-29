import { themeCssVariables } from '@ui/theme-constants';
import { GRAY_SCALE_LIGHT } from '@ui/theme/constants/GrayScaleLight';
import {
  ButtonAccent,
  ButtonDynamicStyles,
  ButtonPosition,
  ButtonVariant,
} from '../Button.types';

export const computeButtonDynamicStyles = (
  variant: ButtonVariant,
  accent: ButtonAccent,
  inverted: boolean,
  disabled: boolean,
  focus: boolean,
  position: ButtonPosition,
): ButtonDynamicStyles => {
  const result: ButtonDynamicStyles = {
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
            ? disabled
              ? themeCssVariables.accent.accent4060
              : themeCssVariables.color.blue
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
            ? !disabled
              ? themeCssVariables.font.color.danger
              : themeCssVariables.color.red5
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

export const computeButtonWrapperColor = (
  variant: ButtonVariant,
  accent: ButtonAccent,
  inverted: boolean,
  disabled: boolean,
): string => {
  switch (variant) {
    case 'primary':
      switch (accent) {
        case 'default':
          return !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.secondary;
        case 'blue':
          return !inverted
            ? GRAY_SCALE_LIGHT.gray1
            : themeCssVariables.color.blue;
        case 'danger':
          return !inverted
            ? themeCssVariables.background.primary
            : themeCssVariables.color.red;
      }
      break;
    case 'secondary':
    case 'tertiary':
      switch (accent) {
        case 'default':
          return !inverted
            ? !disabled
              ? themeCssVariables.font.color.secondary
              : themeCssVariables.font.color.extraLight
            : themeCssVariables.font.color.inverted;
        case 'blue':
          return !inverted
            ? !disabled
              ? themeCssVariables.color.blue
              : themeCssVariables.accent.accent4060
            : themeCssVariables.font.color.inverted;
        case 'danger':
          return !inverted
            ? themeCssVariables.font.color.danger
            : themeCssVariables.font.color.inverted;
      }
      break;
  }
  return themeCssVariables.font.color.secondary;
};
