import styled from '@emotion/styled';
import { type ReactNode } from 'react';

type AutogrowWrapperProps = {
  children: ReactNode;
  node?: ReactNode;
  className?: string;
};

const StyledNodeWrapper = styled.span`
  pointer-events: none;
  visibility: hidden;
  white-space: pre;
`;

const StyledContainer = styled.div`
  max-width: 100%;
  position: relative;
`;

const StyledChildWrapper = styled.div`
  left: 0;
  top: 0;
  position: absolute;
  width: 100%;
`;

export const AutogrowWrapper = ({
  children,
  node = children,
  className,
}: AutogrowWrapperProps) => {
  return (
    <StyledContainer className={className}>
      <StyledNodeWrapper>{node}</StyledNodeWrapper>
      <StyledChildWrapper>{children}</StyledChildWrapper>
    </StyledContainer>
  );
};
