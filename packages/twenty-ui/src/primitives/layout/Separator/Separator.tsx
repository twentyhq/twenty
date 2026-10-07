import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './Separator.module.scss';
import { type SeparatorProps } from './types/SeparatorProps';

export const Separator = ({ className, ...props }: SeparatorProps) => (
  <SeparatorPrimitive
    {...props}
    className={mergeClassNames(styles.root, className)}
  />
);
