import { clsx } from 'clsx';

import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type OverflowingTextProps } from './types/OverflowingTextProps';

import styles from './OverflowingText.module.scss';

export const OverflowingText = ({
  truncate,
  lineClamp,
  dir = 'auto',
  className,
  ...props
}: OverflowingTextProps) => {
  const isMultiline = isDefined(lineClamp);

  return (
    <Text
      {...(isMultiline ? { lineClamp } : { truncate: truncate ?? true })}
      dir={dir}
      className={clsx(
        isMultiline ? styles.overflowingMultilineText : styles.overflowingText,
        className,
      )}
      {...props}
    />
  );
};
