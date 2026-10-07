import { Button } from '@ui/primitives/input/Button/Button';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './BannerAction.module.scss';
import { type BannerActionProps } from '../types/BannerActionProps';

export const BannerAction = ({ className, ...props }: BannerActionProps) => {
  return (
    <Button
      {...props}
      size="sm"
      variant="outline"
      className={mergeClassNames(styles.action, className)}
    />
  );
};
