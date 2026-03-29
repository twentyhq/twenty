'use client';

import { Image } from '@/design-system/components';
import type { ImageType } from '@/design-system/components/Image/types/Image';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const VisualRoot = styled.div`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 995px;
  }
`;

const VisualImage = styled(Image)`
  border-radius: ${theme.radius(1)};
`;

type TabVisualProps = { image: ImageType };

export function TabVisual({ image }: TabVisualProps) {
  return (
    <VisualRoot role="tabpanel">
      <VisualImage src={image.src} alt={image.alt} />
    </VisualRoot>
  );
}
