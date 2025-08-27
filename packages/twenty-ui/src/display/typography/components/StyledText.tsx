import { styled } from '@linaria/react';
import { type ReactElement, type ReactNode } from 'react';

type StyledTextProps = {
  PrefixComponent?: ReactElement;
  text: ReactNode;
  color?: string;
};

export const StyledTextContent = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);

  overflow: hidden;
  padding-left: 0;

  white-space: nowrap;
`;

export const StyledTextWrapper = styled.div<{
  color?: string;
}>`
  --horizontal-padding: var(--spacing-1);
  --vertical-padding: var(--spacing-2);

  cursor: initial;

  display: flex;

  flex-direction: row;

  font-size: var(--font-size-sm);

  gap: var(--spacing-2);

  padding: var(--vertical-padding) 0;

  color: ${({ color }) => color ?? 'var(--font-color-primary)'};
`;

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
