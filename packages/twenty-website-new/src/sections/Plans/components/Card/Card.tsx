import { styled } from '@linaria/react';

import { Body, Heading, LinkButton } from '@/design-system/components';
import { CheckIcon } from '@/icons/informative/Check';
import { IllustrationMount } from '@/illustrations';
import type { PlanCardType } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { css } from '@linaria/core';

const FIXED_ROWS = 4;

const StyledCard = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid transparent;
  border-radius: ${theme.radius(1)};
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: subgrid;
  overflow: hidden;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
  row-gap: ${theme.spacing(4)};
  position: relative;
  z-index: 1;
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const CardHeaderInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  gap: ${theme.spacing(4)};
`;

const cardPlanTitleClassName = css`
  &[data-size='xs'] {
    line-height: ${theme.lineHeight(5)};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-size='xs'] {
      line-height: ${theme.lineHeight(6)};
    }
  }
`;

const priceBodyClassName = css`
  color: ${theme.colors.primary.text[60]};
`;

const PriceLine = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${theme.spacing(1)};
  white-space: nowrap;
`;

const CardIllustrationEmbed = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border: none;
  border-radius: ${theme.radius(2)};
  display: block;
  flex-shrink: 0;
  height: 80px;
  overflow: hidden;
  width: 197px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    margin-left: auto;
    transform: translateX(${theme.spacing(4)});
  }
`;

const CardRule = styled.div`
  border-top: 1px dotted ${theme.colors.primary.border[10]};
  height: 0;
  width: 100%;
`;

const FeaturesList = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: subgrid;
  list-style: none;
  margin: 0;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
`;

const FeatureItem = styled.li`
  align-items: center;
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-template-columns: auto 1fr;
`;

type CardProps = {
  card: PlanCardType;
  highlighted?: boolean;
  maxBullets: number;
};

export function Card({ card, highlighted = false, maxBullets }: CardProps) {
  const totalRows = FIXED_ROWS + maxBullets;

  return (
    <StyledCard style={{ gridRow: `span ${totalRows}` }}>
      <CardHeader>
        <CardHeaderInfo>
          <Heading
            as="h3"
            className={cardPlanTitleClassName}
            segments={card.heading}
            size="xs"
            weight="light"
          />
          <PriceLine>
            <Heading
              as="h4"
              segments={card.price.heading}
              size="sm"
              weight="regular"
            />
            <Body
              as="span"
              body={card.price.body}
              className={priceBodyClassName}
              size="sm"
            />
          </PriceLine>
        </CardHeaderInfo>
        <CardIllustrationEmbed>
          <IllustrationMount illustration={card.illustration} />
        </CardIllustrationEmbed>
      </CardHeader>

      <LinkButton
        color="secondary"
        href="https://app.twenty.com/welcome"
        label="Start for free"
        type="anchor"
        variant={highlighted ? 'contained' : 'outlined'}
      />

      <CardRule />

      <Body body={card.features.title} size="md" />

      <FeaturesList style={{ gridRow: `span ${maxBullets}` }}>
        {card.features.bullets.map((bullet, index) => (
          <FeatureItem key={index}>
            <CheckIcon color={theme.colors.highlight[100]} size={16} />
            <Body as="span" body={bullet} size="sm" />
          </FeatureItem>
        ))}
      </FeaturesList>
    </StyledCard>
  );
}
