'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { AppPreview, type AppPreviewConfig } from '@/sections/AppPreview';

const PreviewRoot = styled.div`
  margin-bottom: ${theme.spacing(11)};
  margin-top: ${theme.spacing(12)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: ${theme.spacing(19)};
  }
`;

type PreviewProps = {
  visual: AppPreviewConfig;
};

export function Preview({ visual }: PreviewProps) {
  return (
    <PreviewRoot>
      <AppPreview showTerminal={false} visual={visual} />
    </PreviewRoot>
  );
}
