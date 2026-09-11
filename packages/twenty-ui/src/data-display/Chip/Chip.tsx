import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Chip.module.scss';
import { type ChipProps } from './types/ChipProps';

export const Chip = ({
  children,
  size = 'sm',
  variant = 'ghost',
  color = 'primary',
  shape = 'square',
  weight = 'regular',
  disabled = false,
  clickable = true,
  nativeButton = true,
  startElement,
  endElement,
  endElementDivider = false,
  maxWidth,
  tooltipLabel,
  tooltipPlace,
  alwaysShowTooltip = false,
  isLabelHidden = false,
  forceEmptyText = false,
  emptyLabel = 'Untitled',
  className,
  style,
  render,
  ref,
  onClick,
  ...props
}: ChipProps) => {
  const hasContent =
    isDefined(children) && children !== '' && children !== false;

  return useRender({
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
    state: { size, variant, color, shape, weight, disabled, clickable },
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
          {!isLabelHidden &&
            (hasContent ? (
              typeof children === 'string' ? (
                <OverflowingTextWithTooltip
                  size={size === 'md' ? 'large' : 'small'}
                  text={children}
                  tooltipContent={tooltipLabel}
                  tooltipPlace={tooltipPlace}
                  alwaysShowTooltip={alwaysShowTooltip}
                />
              ) : (
                <span className={styles.content}>{children}</span>
              )
            ) : (
              !forceEmptyText && (
                <span className={styles.emptyLabel}>{emptyLabel}</span>
              )
            ))}
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
