import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import {
  type CSSProperties,
  type KeyboardEvent,
  type SyntheticEvent,
} from 'react';

import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { themeCssVariables } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Tag.module.scss';
import { type TagProps } from './types/TagProps';

const preventDisabledInteraction = (event: SyntheticEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const preventDisabledKeyboardActivation = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  preventDisabledInteraction(event);
};

export const Tag = ({
  children,
  color,
  weight = 'regular',
  variant = 'soft',
  startIcon,
  preventShrink = false,
  preventPadding = false,
  borderStyle = 'solid',
  disabled = false,
  nativeButton = true,
  onClick,
  className,
  style,
  render,
  ref,
  ...props
}: TagProps) =>
  useRender({
    defaultTagName: 'span',
    render: isDefined(onClick) ? (
      <ButtonPrimitive
        render={render}
        disabled={disabled}
        nativeButton={nativeButton}
      />
    ) : (
      render
    ),
    ref,
    state: {
      variant,
      weight,
      disabled,
      interactive: isDefined(onClick),
      preventShrink,
      preventPadding,
    },
    props: {
      ...props,
      onClick,
      ...(disabled && {
        disabled: true,
        'aria-disabled': true,
        tabIndex: -1,
        onClickCapture: preventDisabledInteraction,
        onPointerDownCapture: preventDisabledInteraction,
        onKeyDownCapture: preventDisabledKeyboardActivation,
        onKeyUpCapture: preventDisabledKeyboardActivation,
      }),
      className: clsx(styles.tag, className),
      style: {
        '--tw-tag-background':
          color === 'transparent'
            ? 'transparent'
            : (themeCssVariables.tag.background[color] ??
              themeCssVariables.tag.background.gray),
        '--tw-tag-text':
          color === 'transparent'
            ? themeCssVariables.font.color.secondary
            : (themeCssVariables.tag.text[color] ??
              themeCssVariables.font.color.secondary),
        '--tw-tag-border-style': borderStyle,
        ...style,
      } as CSSProperties,
      children: (
        <>
          {isDefined(startIcon) &&
            typeof startIcon !== 'boolean' &&
            startIcon !== '' && (
              <span className={styles.iconContainer} aria-hidden>
                {startIcon}
              </span>
            )}
          <span className={styles.content}>
            {typeof children === 'string' && !preventShrink ? (
              <OverflowingTextWithTooltip text={children} />
            ) : (
              children
            )}
          </span>
        </>
      ),
    },
  });
