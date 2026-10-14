import { clsx } from 'clsx';

import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type TextProps } from '@ui/primitives/typography/Text/types/TextProps';

import styles from './OverflowingText.module.scss';

export const OverflowingText = ({
  truncate,
  lineClamp,
  dir = 'auto',
  className,
  ...props
}: TextProps) => {
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
