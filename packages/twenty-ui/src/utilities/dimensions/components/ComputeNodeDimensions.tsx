import styled from '@emotion/styled';
import { isDefined } from '@ui/utilities';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

type ComputeNodeDimensionsProps = {
  children: (
    dimensions: { height: number; width: number } | undefined,
  ) => ReactNode;
  node?: ReactNode;
};

const StyledNodeWrapper = styled.span`
  pointer-events: none;
  position: fixed;
  visibility: hidden;
`;

export const ComputeNodeDimensions = ({
  children,
  node = children(undefined),
}: ComputeNodeDimensionsProps) => {
  const nodeWrapperRef = useRef<HTMLSpanElement>(null);
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
    <>
      <StyledNodeWrapper ref={nodeWrapperRef}>{node}</StyledNodeWrapper>
      {nodeDimensions && children(nodeDimensions)}
    </>
  );
};
