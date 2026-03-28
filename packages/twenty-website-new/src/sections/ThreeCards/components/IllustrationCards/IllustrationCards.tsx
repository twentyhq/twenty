import { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IllustrationCard } from '../IllustrationCard/IllustrationCard';

const IllustrationCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    grid-template-columns: none;
  }
`;

type IllustrationCardsProps = {
  illustrationCards: ThreeCardsIllustrationCardType[];
  variant?: 'shaped' | 'simple';
};

export function IllustrationCards({
  illustrationCards,
  variant = 'shaped',
}: IllustrationCardsProps) {
  return (
    <IllustrationCardsGrid>
      {illustrationCards.map((illustrationCard, index) => (
        <IllustrationCard
          key={index}
          variant={variant}
          illustrationCard={illustrationCard}
        />
      ))}
    </IllustrationCardsGrid>
  );
}
