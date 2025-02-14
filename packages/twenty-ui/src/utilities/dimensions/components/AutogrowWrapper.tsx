import styled from '@emotion/styled';
import { ReactNode, useRef } from 'react';

type AutogrowWrapperProps = {
  children: ReactNode;
  node?: ReactNode;
  className?: string;
};

const StyledNodeWrapper = styled.span`
  pointer-events: none;
  visibility: hidden;
`;

const StyledDiv = styled.div`
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
  const nodeWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <StyledDiv ref={nodeWrapperRef} className={className}>
      <StyledNodeWrapper>{node}</StyledNodeWrapper>
      <StyledChildWrapper>{children}</StyledChildWrapper>
    </StyledDiv>
  );
};
