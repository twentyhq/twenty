import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Switch.module.scss';
import { type SwitchThumbProps } from '../types/SwitchThumbProps';

export const SwitchThumb = ({ className, ...props }: SwitchThumbProps) => (
  <SwitchPrimitive.Thumb
    {...props}
    className={mergeClassNames(styles.thumb, className)}
  />
);
