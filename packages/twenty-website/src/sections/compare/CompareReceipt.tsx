import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Button, Eyebrow, Heading } from '@/ui';

import {
  type CompareReceiptLine,
  type CompetitorComparison,
} from './compare-data';

const TWENTY_CARD_ICON = {
  alt: 'Twenty Organization plan icon',
  src: '/images/pricing/plans/organization-icon.webp',
  widthPx: 80,
};

const ReceiptScope = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  width: 100%;
`;

const Scenario = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  text-align: center;
`;

const CardsGrid = styled.div`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: 1fr;
  width: 100%;

  ${mediaUp('md')} {
    gap: ${spacing(6)};
    grid-template-columns: 1fr 1fr;
  }
`;

// Mirrors the pricing page's PlanCard shell so both pages read as one
// component family.
const CardShell = styled.div`
  background-color: ${color('white')};
  border: 1px solid transparent;
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: ${spacing(4)};
  position: relative;
  z-index: 1;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const CardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  flex-shrink: 0;
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const CardHeaderInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const titleClassName = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PriceLine = styled.div`
  align-items: baseline;
  column-gap: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
`;

const priceSuffixClassName = css`
  color: ${color('black-60')};
  display: block;
  min-width: 0;
`;

// Clones the billing toggle's discount badge so the savings chip is the
// same component language as the pricing page's "-25%".
const SavingsBadge = styled.span`
  align-items: center;
  align-self: center;
  background-color: ${color('blue')};
  border-radius: ${radius(12)};
  color: ${color('white')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  height: 24px;
  justify-content: center;
  margin-left: ${spacing(1)};
  padding-inline: ${spacing(1.5)};
  white-space: nowrap;
`;

const CardRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  flex-shrink: 0;
  height: 0;
  width: 100%;
`;

const CardIcon = styled.div`
  border-radius: ${radius(2)};
  flex-shrink: 0;
  height: 80px;
  margin-left: auto;
  overflow: hidden;
  position: relative;
  width: ${TWENTY_CARD_ICON.widthPx}px;

  img {
    object-fit: contain;
    object-position: center right;
  }
`;

const LinesList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing(3)};
`;

const LineRow = styled.div`
  align-items: baseline;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  gap: ${spacing(3)};
  justify-content: space-between;
  line-height: ${spacing(5.5)};
`;

const LineLabel = styled.span`
  color: ${semanticColor.inkMuted};
`;

const LineAmount = styled.span`
  white-space: nowrap;
`;

const PerUserLine = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
`;

const CtaRow = styled.div`
  flex-shrink: 0;
  margin-top: auto;
  padding-top: ${spacing(4)};
  width: 100%;

  > * {
    display: flex;
    width: 100%;
  }
`;

const FairPlayBlock = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  margin-inline: auto;
  margin-top: ${spacing(6)};
  max-width: 560px;
  text-align: center;
`;

function ReceiptLines({ lines }: { lines: CompareReceiptLine[] }) {
  const i18n = getServerI18n();

  return (
    <LinesList>
      {lines.map((line) => (
        <LineRow key={i18n._(line.label)}>
          <LineLabel>{i18n._(line.label)}</LineLabel>
          <LineAmount>{i18n._(line.amount)}</LineAmount>
        </LineRow>
      ))}
    </LinesList>
  );
}

export function CompareReceipt({
  comparison,
}: {
  comparison: CompetitorComparison;
}) {
  const i18n = getServerI18n();
  const { receipt } = comparison;

  return (
    <ReceiptScope>
      <Scenario>{i18n._(receipt.scenario)}</Scenario>
      <CardsGrid>
        <CardShell>
          <CardHeader>
            <CardHeaderInfo>
              <Heading
                as="h3"
                className={titleClassName}
                family="sans"
                size="xs"
                weight="light"
              >
                {comparison.competitor}
              </Heading>
              <PriceLine>
                <Heading as="h4" family="sans" size="sm" weight="regular">
                  {i18n._(receipt.competitorTotalAmount)}
                </Heading>
                <Body as="span" className={priceSuffixClassName} size="sm">
                  {i18n._(receipt.competitorTotalSuffix)}
                </Body>
              </PriceLine>
            </CardHeaderInfo>
          </CardHeader>
          <CardRule />
          <ReceiptLines lines={receipt.competitorLines} />
          <PerUserLine>{i18n._(receipt.competitorPerUser)}</PerUserLine>
        </CardShell>

        <CardShell>
          <CardHeader>
            <CardHeaderInfo>
              <Heading
                as="h3"
                className={titleClassName}
                family="sans"
                size="xs"
                weight="light"
              >
                Twenty
              </Heading>
              <PriceLine>
                <Heading as="h4" family="sans" size="sm" weight="regular">
                  {i18n._(receipt.twentyTotalAmount)}
                </Heading>
                <Body as="span" className={priceSuffixClassName} size="sm">
                  {i18n._(receipt.twentyTotalSuffix)}
                </Body>
                <SavingsBadge>{i18n._(receipt.multiplier)}</SavingsBadge>
              </PriceLine>
            </CardHeaderInfo>
            <CardIcon>
              <NextImage
                alt={TWENTY_CARD_ICON.alt}
                fill
                sizes={`${TWENTY_CARD_ICON.widthPx}px`}
                src={TWENTY_CARD_ICON.src}
              />
            </CardIcon>
          </CardHeader>
          <CardRule />
          <ReceiptLines lines={receipt.twentyLines} />
          <PerUserLine>{i18n._(receipt.twentyPerUser)}</PerUserLine>
          <CtaRow>
            <Button
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Start for free`)}
              variant="filled"
            />
          </CtaRow>
        </CardShell>
      </CardsGrid>
      <FairPlayBlock>
        <Eyebrow>{i18n._(msg`Fair play`)}</Eyebrow>
        <Body muted size="sm">
          {i18n._(comparison.honest)}
        </Body>
      </FairPlayBlock>
    </ReceiptScope>
  );
}
