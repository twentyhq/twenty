import { Collapsible } from '@base-ui/react/collapsible';
import { type AnimationDuration } from '@ui/theme';

import styles from './AnimatedEaseInOut.module.scss';

type AnimatedEaseInOutProps = {
  isOpen: boolean;
  children: React.ReactNode;
  duration?: AnimationDuration;
  marginBottom?: string;
  marginTop?: string;
  initial?: boolean;
};

export const AnimatedEaseInOut = ({
  children,
  isOpen,
  marginBottom,
  marginTop,
  duration = 'normal',
}: AnimatedEaseInOutProps) => (
  <Collapsible.Root open={isOpen}>
    <Collapsible.Panel
      className={styles.panel}
      data-duration={duration}
      style={
        {
          '--animated-ease-in-out-margin-top': marginTop ?? '0',
          '--animated-ease-in-out-margin-bottom': marginBottom ?? '0',
        } as React.CSSProperties
      }
    >
      {children}
    </Collapsible.Panel>
  </Collapsible.Root>
);
