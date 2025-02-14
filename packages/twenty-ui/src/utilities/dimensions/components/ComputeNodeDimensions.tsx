import styled from '@emotion/styled';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared';

type ComputeNodeDimensionsProps = {
  children: (
    dimensions: { height: number; width: number } | undefined,
  ) => ReactNode;
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
  position: absolute;
  top: 0;
`;

export const ComputeNodeDimensions = ({
  children,
  node = children(undefined),
  className,
}: ComputeNodeDimensionsProps) => {
  const nodeWrapperRef = useRef<HTMLDivElement>(null);
  const [nodeDimensions, setNodeDimensions] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);

  useLayoutEffect(() => {
    if (!nodeWrapperRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (isDefined(nodeWrapperRef.current)) {
        setNodeDimensions({
          width: nodeWrapperRef.current.offsetWidth,
          height: nodeWrapperRef.current.offsetHeight,
        });
      }
    });
    resizeObserver.observe(nodeWrapperRef.current);
    return () => resizeObserver.disconnect();
  }, [nodeWrapperRef]);

  return (
    <StyledDiv ref={nodeWrapperRef} className={className}>
      <StyledNodeWrapper>{node}</StyledNodeWrapper>
      <StyledChildWrapper>
        {nodeDimensions && children(nodeDimensions)}
      </StyledChildWrapper>
    </StyledDiv>
  );
};
