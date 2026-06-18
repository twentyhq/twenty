import { type ReactElement, type ReactNode } from 'react';
import { clsx } from 'clsx';

import styles from './StyledText.module.scss';

type StyledTextProps = {
  PrefixComponent?: ReactElement;
  text: ReactNode;
  color?: string;
};

type StyledTextContentProps = React.ComponentPropsWithoutRef<'div'>;

export const StyledTextContent = ({
  className,
  ...divProps
}: StyledTextContentProps) => (
  // oxlint-disable-next-line react/jsx-props-no-spreading
  <div className={clsx(styles.content, className)} {...divProps} />
);

type StyledTextWrapperProps = React.ComponentPropsWithoutRef<'div'> & {
  color?: string;
};

export const StyledTextWrapper = ({
  color,
  className,
  style,
  ...divProps
}: StyledTextWrapperProps) => (
  <div
    className={clsx(styles.wrapper, className)}
    style={
      color
        ? ({ '--styled-text-color': color, ...style } as React.CSSProperties)
        : style
    }
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...divProps}
  />
);

export const StyledText = ({
  PrefixComponent,
  text,
  color,
}: StyledTextProps) => {
  return (
    <StyledTextWrapper color={color}>
      {PrefixComponent ? PrefixComponent : null}
      <StyledTextContent>{text}</StyledTextContent>
    </StyledTextWrapper>
  );
};
