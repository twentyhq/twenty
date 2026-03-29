'use client';

import { Image } from '@/design-system/components';
import type { ImageType } from '@/design-system/components/Image/types/Image';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const PanelRoot = styled.div`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 995px;
  }
`;

const PanelImage = styled(Image)`
  border-radius: ${theme.radius(1)};
`;

type TabPanelProps = { image: ImageType };

export function TabPanel({ image }: TabPanelProps) {
  return (
    <PanelRoot role="tabpanel">
      <PanelImage src={image.src} alt={image.alt} />
    </PanelRoot>
  );
}
