import styled from '@emotion/styled';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared';

type ComputeNodeDimensionsProps = {
  children: (
    dimensions: { height: number; width: number } | undefined,
  ) => ReactNode;
  node?: ReactNode;
};

const StyledNodeWrapper = styled.span`
  pointer-events: none;
  visibility: hidden;
`;

const StyledDiv = styled.div`
  max-width: 100%;
  position: relative;
`;

export const ComputeNodeDimensions = ({
  children,
  node = children(undefined),
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
    <StyledDiv ref={nodeWrapperRef}>
      <StyledNodeWrapper>{node}</StyledNodeWrapper>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        {nodeDimensions && children(nodeDimensions)}
      </div>
    </StyledDiv>
  );
};
