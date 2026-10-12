import { useRender } from '@base-ui/react/use-render';
import { isBoolean, isString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Chip.module.scss';
import { type ChipProps } from './types/ChipProps';

const MEDIUM_LABEL_STYLE: CSSProperties = { height: 'var(--t-spacing-4)' };

export const Chip = ({
  children,
  size = 'sm',
  variant = 'ghost',
  color = 'primary',
  shape = 'square',
  weight = 'regular',
  onClick,
  clickable = isDefined(onClick),
  startElement,
  endElement,
  endElementDivider = false,
  maxWidth,
  truncate = true,
  tooltipContent,
  tooltipDelay,
  isTooltipMultiline,
  tooltipPlace,
  alwaysShowTooltip = false,
  className,
  style,
  render,
  ref,
  ...props
}: ChipProps) => {
  const hasContent =
    isDefined(children) && !isBoolean(children) && children !== '';
  const textProps = isString(children)
    ? { text: children, tooltipContent }
    : { text: children ?? false, tooltipContent: tooltipContent ?? '' };

  return useRender({
    render,
    ref,
    state: { size, variant, color, shape, weight, clickable, truncate },
    props: {
      ...props,
      onClick,
      className: clsx(styles.chip, className),
      style: {
        ...(isDefined(maxWidth)
          ? {
              '--tw-chip-max-width': `calc(${maxWidth}px - 2 * var(--tw-chip-padding))`,
            }
          : {}),
        ...style,
      } as CSSProperties,
      children: (
        <>
          {startElement}
          {hasContent && (
            <OverflowingTextWithTooltip
              {...textProps}
              render={<span />}
              style={size === 'md' ? MEDIUM_LABEL_STYLE : undefined}
              truncate={truncate}
              tooltipDelay={tooltipDelay}
              isTooltipMultiline={isTooltipMultiline}
              tooltipPlace={tooltipPlace}
              alwaysShowTooltip={alwaysShowTooltip}
            />
          )}
          {isDefined(endElement) && endElement !== false && (
            <>
              {endElementDivider && (
                <span className={styles.endElementDivider} />
              )}
              {endElement}
            </>
          )}
        </>
      ),
    },
  });
};
