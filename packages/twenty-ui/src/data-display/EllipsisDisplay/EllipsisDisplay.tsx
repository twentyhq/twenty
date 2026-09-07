import { clsx } from 'clsx';

import { Text } from '@ui/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './EllipsisDisplay.module.scss';

type EllipsisDisplayProps = {
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
};

export const EllipsisDisplay = ({
  children,
  maxWidth,
  className,
}: EllipsisDisplayProps) => (
  <Text
    truncate
    className={clsx(styles.ellipsis, className)}
    style={isDefined(maxWidth) ? { maxWidth: `${maxWidth}px` } : undefined}
  >
    {children}
  </Text>
);
