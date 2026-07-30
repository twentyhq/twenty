import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { INFORMATIVE_MARKS } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { type CompetitorComparison } from './compare-data';

const CheckMark = INFORMATIVE_MARKS.check;

const REPORT_INACCURACY_URL =
  'https://github.com/twentyhq/twenty/issues/new/choose';

const TableScope = styled.div`
  color: ${semanticColor.ink};
  width: 100%;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  width: 100%;
`;

const HeadCell = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: ${spacing(7)};
  padding: ${spacing(4)};

  &[data-tier] {
    border-left: 1px solid ${semanticColor.line};
  }
`;

const FeatureCell = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  justify-content: center;
  min-height: ${spacing(18)};
  padding: ${spacing(4)};
`;

const FeatureName = styled.span`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const FeatureDescription = styled.span`
  color: ${semanticColor.inkMuted};
  display: none;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};

  ${mediaUp('md')} {
    display: block;
  }
`;

const ValueCell = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  border-left: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  justify-content: center;
  min-height: ${spacing(18)};
  padding: ${spacing(4)};
`;

const CompetitorPrice = styled.span`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const CompetitorDetail = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
`;

const SourceLink = styled.a`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  text-decoration: underline;
  text-underline-offset: 2px;
  width: fit-content;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const IncludedRow = styled.div`
  align-items: center;
  column-gap: ${spacing(2.5)};
  display: flex;
`;

const IncludedText = styled.span`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
`;

const SourceNote = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: ${spacing(5.5)};
  margin-top: ${spacing(6)};
  max-width: 640px;
`;

const ReportLink = styled.a`
  color: ${semanticColor.inkMuted};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

export function CompareCostTable({
  comparison,
}: {
  comparison: CompetitorComparison;
}) {
  const i18n = getServerI18n();

  return (
    <TableScope>
      <GridRow>
        <HeadCell>{i18n._(msg`Feature`)}</HeadCell>
        <HeadCell data-tier>{i18n._(comparison.competitorColumnLabel)}</HeadCell>
        <HeadCell data-tier>{i18n._(msg`On Twenty`)}</HeadCell>
      </GridRow>
      {comparison.rows.map((row) => (
        <GridRow key={i18n._(row.feature)}>
          <FeatureCell>
            <FeatureName>{i18n._(row.feature)}</FeatureName>
            <FeatureDescription>{i18n._(row.description)}</FeatureDescription>
          </FeatureCell>
          <ValueCell>
            <CompetitorPrice>{i18n._(row.competitor.price)}</CompetitorPrice>
            <CompetitorDetail>{i18n._(row.competitor.detail)}</CompetitorDetail>
            {row.competitor.sourceUrl !== undefined ? (
              <SourceLink
                href={row.competitor.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {i18n._(msg`source`)}
              </SourceLink>
            ) : null}
          </ValueCell>
          <ValueCell>
            <IncludedRow>
              <CheckMark color={color('blue')} sizePx={16} />
              <IncludedText>{i18n._(row.twenty.detail)}</IncludedText>
            </IncludedRow>
          </ValueCell>
        </GridRow>
      ))}
      <SourceNote>
        {i18n._(comparison.sourceNote)}{' '}
        <ReportLink href={REPORT_INACCURACY_URL} rel="noreferrer" target="_blank">
          {i18n._(msg`Spotted an inaccuracy? Tell us and we will fix it.`)}
        </ReportLink>
      </SourceNote>
    </TableScope>
  );
}
