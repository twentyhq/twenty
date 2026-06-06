import { styled } from '@linaria/react';
import type { ComponentType } from 'react';

import { InteractiveVisualMount } from './InteractiveVisualMount';

const VisualContainer = styled.div`
  height: 100%;
  width: 100%;
`;

type TileVisualProps = {
  visual: ComponentType<{ active: boolean }>;
};

export function TileVisual({ visual }: TileVisualProps) {
  return (
    <VisualContainer>
      <InteractiveVisualMount visual={visual} />
    </VisualContainer>
  );
}
