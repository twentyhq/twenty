'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/design-system/components';
import type { MarketplacePartner } from '@/lib/twenty-api';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { PartnerCard } from './PartnerCard';

const EXIT_TRANSITION_MS = 200;

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

const CardSlot = styled.div`
  opacity: 1;
  transition: opacity ${EXIT_TRANSITION_MS}ms ease;

  &[data-exiting='true'] {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

type MarketplaceGridProps = {
  partners: readonly MarketplacePartner[];
};

export function MarketplaceGrid({ partners }: MarketplaceGridProps) {
  const [rendered, setRendered] = useState(partners);
  const [exitingSlugs, setExitingSlugs] = useState<ReadonlySet<string>>(
    new Set(),
  );

  useEffect(() => {
    const currentSlugs = new Set(rendered.map((p) => p.slug));
    const targetSlugs = new Set(partners.map((p) => p.slug));
    const toRemove = [...currentSlugs].filter((s) => !targetSlugs.has(s));

    if (toRemove.length > 0) {
      setExitingSlugs(new Set(toRemove));
      const t = setTimeout(() => {
        setRendered(partners);
        setExitingSlugs(new Set());
      }, EXIT_TRANSITION_MS);
      return () => clearTimeout(t);
    }

    const sameContent =
      rendered.length === partners.length &&
      rendered.every((p, i) => p.slug === partners[i]?.slug);
    if (!sameContent) {
      setRendered(partners);
    }

    return undefined;
  }, [partners, rendered]);

  return (
    <Section>
      <StyledContainer>
        <CardGrid>
          {rendered.map((partner, index) => (
            <CardSlot
              key={partner.slug}
              data-exiting={exitingSlugs.has(partner.slug)}
            >
              <PartnerCard partner={partner} index={index} />
            </CardSlot>
          ))}
        </CardGrid>
      </StyledContainer>
    </Section>
  );
}
