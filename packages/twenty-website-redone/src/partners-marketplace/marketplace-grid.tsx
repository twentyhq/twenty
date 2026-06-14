import { styled } from '@linaria/react';

import { mediaUp, spacing } from '@/tokens';

import { type MarketplacePartner } from './marketplace-partner';
import { PartnerCard } from './partner-card';

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

type MarketplaceGridProps = {
  partners: readonly MarketplacePartner[];
};

export function MarketplaceGrid({ partners }: MarketplaceGridProps) {
  return (
    <CardGrid>
      {partners.map((partner, index) => (
        <PartnerCard key={partner.slug} partner={partner} index={index} />
      ))}
    </CardGrid>
  );
}
