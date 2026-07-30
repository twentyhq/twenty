import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

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

import { type CompetitorComparison } from './compare-data';

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

const Card = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(5)};

  &[data-highlighted] {
    border-color: ${color('blue')};
  }
`;

const CardTitle = styled.p`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const LineRow = styled.div`
  align-items: baseline;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const LineLabel = styled.span`
  color: ${semanticColor.inkMuted};
`;

const LineAmount = styled.span`
  white-space: nowrap;
`;

const CardRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  height: 0;
  width: 100%;
`;

const TotalRow = styled.div`
  align-items: baseline;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(3)};
  justify-content: space-between;
`;

const PerUserLine = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
`;

const MultiplierBadge = styled.p`
  align-self: center;
  background-color: ${color('blue')};
  border-radius: 999px;
  color: ${color('white')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  padding: ${spacing(1.5)} ${spacing(4)};
`;

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
        <Card>
          <CardTitle>{comparison.competitor}</CardTitle>
          {receipt.competitorLines.map((line) => (
            <LineRow key={i18n._(line.label)}>
              <LineLabel>{i18n._(line.label)}</LineLabel>
              <LineAmount>{i18n._(line.amount)}</LineAmount>
            </LineRow>
          ))}
          <CardRule />
          <TotalRow>
            <span>{i18n._(msg`Total`)}</span>
            <span>{i18n._(receipt.competitorTotal)}</span>
          </TotalRow>
          <PerUserLine>{i18n._(receipt.competitorPerUser)}</PerUserLine>
        </Card>
        <Card data-highlighted>
          <CardTitle>Twenty</CardTitle>
          {receipt.twentyLines.map((line) => (
            <LineRow key={i18n._(line.label)}>
              <LineLabel>{i18n._(line.label)}</LineLabel>
              <LineAmount>{i18n._(line.amount)}</LineAmount>
            </LineRow>
          ))}
          <CardRule />
          <TotalRow>
            <span>{i18n._(msg`Total`)}</span>
            <span>{i18n._(receipt.twentyTotal)}</span>
          </TotalRow>
          <PerUserLine>{i18n._(receipt.twentyPerUser)}</PerUserLine>
        </Card>
      </CardsGrid>
      <MultiplierBadge>{i18n._(receipt.multiplier)}</MultiplierBadge>
    </ReceiptScope>
  );
}
