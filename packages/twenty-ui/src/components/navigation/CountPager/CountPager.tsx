import { useRender } from '@base-ui/react/use-render';
import { isInteger } from '@sniptt/guards';
import { clsx } from 'clsx';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconChevronLeft, IconChevronRight } from '@ui/icon';
import { Text } from '@ui/primitives/typography/Text/Text';

import styles from './CountPager.module.scss';
import { type CountPagerProps } from './types/CountPagerProps';

export const CountPager = ({
  index,
  count,
  onIndexChange,
  positionText,
  previousLabel,
  nextLabel,
  disabled = false,
  positionPlacement = 'between',
  render,
  ref,
  className,
  ...props
}: CountPagerProps) => {
  const isIndexInRange =
    isInteger(index) && isInteger(count) && index >= 0 && index < count;
  const isPreviousDisabled = disabled || !isIndexInRange || index === 0;
  const isNextDisabled = disabled || !isIndexInRange || index === count - 1;
  const position = (
    <Text
      render={<span />}
      className={styles.position}
      aria-live="polite"
      aria-atomic="true"
    >
      {positionText}
    </Text>
  );

  return useRender({
    render,
    ref,
    props: {
      role: 'group',
      ...props,
      className: clsx(styles.pager, className),
      'data-position-placement': positionPlacement,
      children: (
        <>
          {positionPlacement === 'start' && position}
          <LightIconButton
            size="sm"
            disabled={isPreviousDisabled}
            onClick={() => onIndexChange(index - 1)}
            aria-label={previousLabel}
          >
            <IconChevronLeft className={styles.icon} />
          </LightIconButton>
          {positionPlacement === 'between' && position}
          <LightIconButton
            size="sm"
            disabled={isNextDisabled}
            onClick={() => onIndexChange(index + 1)}
            aria-label={nextLabel}
          >
            <IconChevronRight className={styles.icon} />
          </LightIconButton>
        </>
      ),
    },
  });
};
