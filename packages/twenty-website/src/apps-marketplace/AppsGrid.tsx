import { styled } from '@linaria/react';

import { mediaUp, spacing } from '@/tokens';

import { AppCard } from './AppCard';
import { type MarketplaceApp } from './marketplace-app';

const CardGrid = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: 1fr;

  ${mediaUp('md')} {
    gap: ${spacing(8)};
    grid-template-columns: repeat(2, 1fr);
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

type AppsGridProps = {
  apps: readonly MarketplaceApp[];
};

export function AppsGrid({ apps }: AppsGridProps) {
  return (
    <CardGrid>
      {apps.map((app, index) => (
        <AppCard key={app.slug} app={app} index={index} />
      ))}
    </CardGrid>
  );
}
