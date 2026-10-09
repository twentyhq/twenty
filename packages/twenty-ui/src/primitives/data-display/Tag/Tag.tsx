import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { isBoolean, isString } from '@sniptt/guards';
import { type CSSProperties } from 'react';

import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { themeCssVariables } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Tag.module.scss';
import { type TagProps } from './types/TagProps';

export const Tag = ({
  children,
  color,
  weight = 'regular',
  variant = 'soft',
  startIcon,
  truncate = true,
  borderStyle = 'solid',
  className,
  style,
  render,
  ref,
  ...props
}: TagProps) =>
  useRender({
    defaultTagName: 'span',
    render,
    ref,
    state: {
      variant,
      weight,
      truncate,
    },
    props: {
      ...props,
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
            !isBoolean(startIcon) &&
            startIcon !== '' && (
              <span className={styles.iconContainer} aria-hidden>
                {startIcon}
              </span>
            )}
          <span className={styles.content}>
            {isString(children) && truncate ? (
              <OverflowingTextWithTooltip
                text={children}
                render={<span />}
                style={{ display: 'block' }}
              />
            ) : (
              children
            )}
          </span>
        </>
      ),
    },
  });
