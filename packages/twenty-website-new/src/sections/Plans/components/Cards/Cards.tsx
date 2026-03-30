import type { PlanCardType } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { Card } from '../Card/Card';

const CardsGrid = styled.div`
  column-gap: ${theme.spacing(4)};
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(4)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

type CardsProps = {
  organization: PlanCardType;
  pro: PlanCardType;
};

export function Cards({ organization, pro }: CardsProps) {
  const maxBullets = Math.max(
    pro.features.bullets.length,
    organization.features.bullets.length,
  );

  return (
    <CardsGrid>
      <Card card={pro} maxBullets={maxBullets} />
      <Card card={organization} highlighted maxBullets={maxBullets} />
    </CardsGrid>
  );
}
