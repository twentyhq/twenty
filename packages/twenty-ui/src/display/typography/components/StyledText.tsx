import { type ReactElement, type ReactNode } from 'react';
import styled from '@emotion/styled';

type StyledTextProps = {
  PrefixComponent?: ReactElement;
  text: ReactNode;
  color?: string;
};

export const StyledTextContent = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  overflow: hidden;
  padding-left: 0;

  white-space: nowrap;
`;

export const StyledTextWrapper = styled.div<{
  color?: string;
}>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  cursor: initial;

  display: flex;

  flex-direction: row;

  font-size: ${({ theme }) => theme.font.size.sm};

  gap: ${({ theme }) => theme.spacing(2)};

  padding: var(--vertical-padding) 0;

  color: ${({ theme, color }) => color ?? theme.font.color.primary};
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
