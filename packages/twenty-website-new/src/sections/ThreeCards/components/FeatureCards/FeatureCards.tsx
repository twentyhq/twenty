import { ThreeCardsFeatureCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { FeatureCard } from '../FeatureCard/FeatureCard';

const FeatureCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    grid-template-columns: none;
  }
`;

type FeatureCardsProps = { featureCards: ThreeCardsFeatureCardType[] };

export function FeatureCards({ featureCards }: FeatureCardsProps) {
  return (
    <FeatureCardsGrid>
      {featureCards.map((featureCard, index) => (
        <FeatureCard key={index} featureCard={featureCard} />
      ))}
    </FeatureCardsGrid>
  );
}
