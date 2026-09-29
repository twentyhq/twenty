import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { type AnimationDuration } from '@ui/theme';
import { clsx } from 'clsx';

import { type AnimationDimension } from '@ui/primitives/layout/Collapsible/types/AnimationDimension';
import { type AnimationDurations } from '@ui/primitives/layout/Collapsible/types/AnimationDurations';

import styles from './Collapsible.module.scss';

type CollapsibleProps = {
  children: React.ReactNode;
  isExpanded: boolean;
  dimension?: AnimationDimension;
  animationDurations?: AnimationDurations;
  containAnimation?: boolean;
  duration?: AnimationDuration;
};

export const Collapsible = ({
  children,
  isExpanded,
  dimension = 'height',
  animationDurations = 'default',
  containAnimation = true,
  duration,
}: CollapsibleProps) => {
  const durationStyle =
    animationDurations === 'default'
      ? undefined
      : ({
          '--collapsible-opacity-duration': `${animationDurations.opacity}s`,
          '--collapsible-size-duration': `${animationDurations.size}s`,
        } as React.CSSProperties);

  return (
    <BaseCollapsible.Root open={isExpanded}>
      <BaseCollapsible.Panel
        className={clsx(styles.panel, containAnimation && styles.contained)}
        data-dimension={dimension}
        data-duration={duration}
        style={durationStyle}
      >
        {children}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
};
