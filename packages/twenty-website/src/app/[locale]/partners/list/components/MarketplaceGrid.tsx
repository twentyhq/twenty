import { Container } from '@/design-system/components';
import type { MarketplacePartner } from '@/lib/partners-api';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { PartnerCard } from './PartnerCard';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(28)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(36)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${theme.spacing(6)};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(8)};
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

type MarketplaceGridProps = {
  partners: readonly MarketplacePartner[];
};

export function MarketplaceGrid({ partners }: MarketplaceGridProps) {
  return (
    <Section>
      <StyledContainer>
        <CardGrid>
          {partners.map((partner, index) => (
            <PartnerCard key={partner.slug} partner={partner} index={index} />
          ))}
        </CardGrid>
      </StyledContainer>
    </Section>
  );
}
