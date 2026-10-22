import { useRender } from '@base-ui/react/use-render';
import { isNumber } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { Separator } from '@ui/primitives/layout/Separator/Separator';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isRenderableSlot } from '@ui/utilities/internal/isRenderableSlot';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './FormFieldRow.module.scss';
import { type FormFieldRowProps } from './types/FormFieldRowProps';

export const FormFieldRow = ({
  label,
  startIcon,
  trailing,
  trailingProps,
  children,
  labelWidth = 80,
  isHoverable = false,
  hasDivider = true,
  render,
  ref,
  className,
  style,
  ...props
}: FormFieldRowProps) => {
  const rowStyle: CSSProperties & {
    '--form-field-row-label-width': string;
  } = {
    '--form-field-row-label-width': isNumber(labelWidth)
      ? `${labelWidth}px`
      : labelWidth,
    ...style,
  };

  return useRender({
    render,
    ref,
    props: {
      role: 'group',
      'aria-label': label,
      ...props,
      'data-clickable': isDefined(props.onClick) || undefined,
      'data-hoverable': isHoverable || undefined,
      className: clsx(styles.root, className),
      style: rowStyle,
      children: (
        <>
          <div className={styles.surface}>
            {isRenderableSlot(startIcon) && (
              <span className={styles.icon} aria-hidden="true">
                {startIcon}
              </span>
            )}
            {isRenderableSlot(label) && (
              <Text
                render={<span />}
                className={styles.label}
                size="md"
                weight="regular"
                color="tertiary"
                aria-hidden="true"
              >
                {label}
              </Text>
            )}
            <div className={styles.content}>{children}</div>
            {isRenderableSlot(trailing) && (
              <div
                // oxlint-disable-next-line react/jsx-props-no-spreading
                {...trailingProps}
                className={clsx(styles.trailing, trailingProps?.className)}
              >
                {trailing}
              </div>
            )}
          </div>
          {hasDivider && (
            <Separator className={styles.divider} aria-hidden="true" />
          )}
        </>
      ),
    },
  });
};
