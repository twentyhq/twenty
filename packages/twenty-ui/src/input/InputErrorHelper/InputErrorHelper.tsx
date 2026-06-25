import { clsx } from 'clsx';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './InputErrorHelper.module.scss';

type InputErrorHelperProps = {
  children?: React.ReactNode;
  className?: string;
};

export const InputErrorHelper = ({
  children,
  className,
}: InputErrorHelperProps) => (
  <div>
    {isDefined(children) && (
      <div className={clsx(styles.errorHelper, className)} aria-live="polite">
        {children}
      </div>
    )}
  </div>
);
