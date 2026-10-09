import { Button } from '@ui/primitives/input/Button/Button';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from './CalloutAction.module.scss';
import { type CalloutActionProps } from '../types/CalloutActionProps';

export const CalloutAction = ({ className, ...props }: CalloutActionProps) => {
  return (
    <Button
      {...props}
      size="sm"
      variant="ghost"
      className={mergeClassNames(styles.action, className)}
    />
  );
};
