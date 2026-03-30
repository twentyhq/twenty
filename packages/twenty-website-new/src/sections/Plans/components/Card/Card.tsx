import { Body, Heading, LinkButton } from '@/design-system/components';
import { CheckIcon } from '@/icons/informative/Check';
import type { PlanCardType } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const FIXED_ROWS = 4;

const StyledCard = styled.div`
  background-color: ${theme.colors.primary.background[100]};
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

  &[data-highlighted='true'] {
    border: 1px solid ${theme.colors.highlight[100]};
  }
`;

const CardHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-content: space-between;
  overflow: hidden;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: 1fr auto;
  }
`;

const CardHeaderInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 0;
  overflow: hidden;
  row-gap: ${theme.spacing(4)};
`;

const PriceLine = styled.div`
  align-items: baseline;
  display: flex;
  white-space: nowrap;
`;

const CardIllustration = styled.iframe`
  background-color: ${theme.colors.primary.background[100]};
  border: none;
  display: none;
  flex-shrink: 0;
  height: 112px;
  overflow: hidden;
  width: 197px;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
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
    <StyledCard
      data-highlighted={highlighted}
      style={{ gridRow: `span ${totalRows}` }}
    >
      <CardHeader>
        <CardHeaderInfo>
          <Heading
            as="h3"
            segments={card.heading}
            size="md"
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
              size="sm"
            />
          </PriceLine>
        </CardHeaderInfo>
        <CardIllustration
          allow="clipboard-write; encrypted-media; gyroscope; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          src={card.illustration.src}
          title={card.illustration.title}
        />
      </CardHeader>

      <LinkButton
        color="secondary"
        href="https://app.twenty.com/welcome"
        label="Start for free"
        type="anchor"
        variant="contained"
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
