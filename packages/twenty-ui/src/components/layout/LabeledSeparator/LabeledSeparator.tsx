import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { Separator } from '@ui/primitives/layout/Separator/Separator';
import { Text } from '@ui/primitives/typography/Text/Text';

import styles from './LabeledSeparator.module.scss';
import { type LabeledSeparatorProps } from './types/LabeledSeparatorProps';

export const LabeledSeparator = ({
  children,
  labelPosition = 'center',
  tone = 'neutral',
  hasStartMarker = false,
  className,
  render,
  ref,
  ...props
}: LabeledSeparatorProps) =>
  useRender({
    render,
    ref,
    props: {
      role: 'separator',
      'aria-orientation': 'horizontal',
      'aria-label': children,
      ...props,
      'data-tone': tone,
      className: clsx(styles.root, className),
      children: (
        <>
          <span className={styles.rule} aria-hidden="true">
            {hasStartMarker && <span className={styles.marker} />}
            <Separator className={styles.line} aria-hidden />
          </span>
          <Text
            render={<span />}
            size={tone === 'danger' ? 'sm' : 'xs'}
            weight={tone === 'danger' ? 'medium' : 'semibold'}
            className={styles.label}
          >
            {children}
          </Text>
          {labelPosition === 'center' && (
            <Separator className={styles.line} aria-hidden />
          )}
        </>
      ),
    },
  });
