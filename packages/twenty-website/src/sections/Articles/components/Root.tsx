import type { ReactNode } from 'react';

import { styled } from '@linaria/react';

import { theme } from '@/theme';

type RootVariant = 'article' | 'index';

type RootProps = {
  children: ReactNode;
  variant?: RootVariant;
};

const RootSection = styled.section`
  color: ${theme.colors.primary.text[100]};

  &[data-variant='index'] {
    background: radial-gradient(
        circle at 14% 8%,
        rgba(255, 255, 255, 0.76),
        transparent 30%
      ),
      linear-gradient(180deg, #f4f2ec 0%, #ffffff 44%, #f3f3f3 100%);
  }

  &[data-variant='article'] {
    background: linear-gradient(180deg, #f4f2ec 0%, #ffffff 360px);
  }
`;

export function Root({ children, variant = 'index' }: RootProps) {
  return <RootSection data-variant={variant}>{children}</RootSection>;
}
