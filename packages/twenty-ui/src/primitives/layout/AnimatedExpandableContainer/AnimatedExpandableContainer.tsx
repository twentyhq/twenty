import { Collapsible } from '@base-ui/react/collapsible';
import { clsx } from 'clsx';

import { type AnimationDimension } from '@ui/primitives/layout/AnimatedExpandableContainer/types/AnimationDimension';
import { type AnimationDurations } from '@ui/primitives/layout/AnimatedExpandableContainer/types/AnimationDurations';
import { type AnimationMode } from '@ui/primitives/layout/AnimatedExpandableContainer/types/AnimationMode';

import styles from './AnimatedExpandableContainer.module.scss';

type AnimatedExpandableContainerProps = {
  children: React.ReactNode;
  isExpanded: boolean;
  dimension?: AnimationDimension;
  animationDurations?: AnimationDurations;
  mode?: AnimationMode;
  containAnimation?: boolean;
  initial?: boolean;
};

export const AnimatedExpandableContainer = ({
  children,
  isExpanded,
  dimension = 'height',
  animationDurations = 'default',
  containAnimation = true,
}: AnimatedExpandableContainerProps) => {
  const durationStyle =
    animationDurations === 'default'
      ? undefined
      : ({
          '--animated-expandable-opacity-duration': `${animationDurations.opacity}s`,
          '--animated-expandable-size-duration': `${animationDurations.size}s`,
        } as React.CSSProperties);

  return (
    <Collapsible.Root open={isExpanded}>
      <Collapsible.Panel
        className={clsx(styles.panel, containAnimation && styles.contained)}
        data-dimension={dimension}
        style={durationStyle}
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
