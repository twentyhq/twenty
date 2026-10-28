'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';

import { INFORMATIVE_MARKS } from '@/icons';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { usePricingState } from '@/pricing-state';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';
import { Button } from '@/ui';

import { PlanTableInfoTooltip } from './PlanTableInfoTooltip';
import { PLAN_TABLE_DATA } from './plan-table-data';
import {
  type PlanTableBodyRowDataType,
  type PlanTableCellType,
  type PlanTableFeatureRowDataType,
  type PlanTableTierColumnType,
  type PlanTableTierId,
} from './plan-table-types';
import { resolveVisibleRows } from './plan-table-visible-rows';

const CrossMark = INFORMATIVE_MARKS.cross;
const InfinityMark = INFORMATIVE_MARKS.infinity;
const TickMark = INFORMATIVE_MARKS.tick;

const TableScope = styled.div`
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
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

  &[data-highlighted] {
    background-color: ${color('white-5')};
    box-shadow: inset 0 2px 0 ${color('blue')};
  }
`;

const FeatureLabel = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: ${spacing(8)};
  min-height: ${spacing(16)};
  padding: ${spacing(4)};
  position: relative;
`;

const TierCell = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  border-left: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  justify-content: center;
  line-height: ${spacing(5.5)};
  min-height: ${spacing(16)};
  padding: ${spacing(4)};

  &[data-highlighted] {
    background-color: ${color('white-5')};
  }
`;

const TierText = styled.span`
  color: ${semanticColor.ink};
`;

const MetricLine = styled.span`
  align-items: baseline;
  column-gap: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
`;

const MetricValue = styled.span`
  color: ${semanticColor.ink};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const MetricUnit = styled.span`
  color: ${semanticColor.inkMuted};
`;

const CellDetail = styled.span`
  color: ${semanticColor.inkMuted};
  font-size: ${fontSize(3.5)};
  line-height: ${spacing(5)};
`;

const CellMark = styled.span`
  align-items: center;
  column-gap: ${spacing(2.5)};
  display: flex;
`;

const CategoryBand = styled.div`
  align-items: center;
  background-color: ${color('white-10')};
  display: flex;
  min-height: ${spacing(16)};
  padding: ${spacing(2)} ${spacing(4)};
`;

const CategoryTitle = styled.span`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: ${spacing(7)};
  width: 100%;
`;

const CollapsibleWrapper = styled.div`
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.4s ${EASING.standard},
    opacity 0.4s ${EASING.standard},
    visibility 0.4s ${EASING.standard};
  visibility: hidden;
  width: 100%;

  &[data-expanded] {
    grid-template-rows: 1fr;
    opacity: 1;
    visibility: visible;
  }
`;

const CollapsibleInner = styled.div`
  overflow: hidden;
`;

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing(10)};
  width: 100%;
`;

// Enterprise inherits the Organization cell unless a row overrides it.
function resolveCell(
  row: PlanTableFeatureRowDataType,
  columnId: PlanTableTierId,
): PlanTableCellType {
  return (
    row.tiers[columnId] ??
    (columnId === 'enterprise' ? row.tiers.organization : undefined) ?? {
      kind: 'dash',
    }
  );
}

function CellValue({ cell }: { cell: PlanTableCellType }) {
  const { i18n } = useLingui();

  if (cell.kind === 'text') {
    return (
      <>
        {cell.suffix === undefined ? (
          <TierText>{i18n._(cell.text)}</TierText>
        ) : (
          <MetricLine>
            <TierText>{i18n._(cell.text)}</TierText>
            <MetricUnit>{i18n._(cell.suffix)}</MetricUnit>
          </MetricLine>
        )}
        {cell.detail !== undefined ? (
          <CellDetail>{i18n._(cell.detail)}</CellDetail>
        ) : null}
      </>
    );
  }

  if (cell.kind === 'metric') {
    return (
      <>
        <MetricLine>
          {cell.prefix !== undefined ? (
            <MetricUnit>{i18n._(cell.prefix)}</MetricUnit>
          ) : null}
          <MetricValue>{i18n._(cell.value)}</MetricValue>
          <MetricUnit>{i18n._(cell.unit)}</MetricUnit>
        </MetricLine>
        {cell.detail !== undefined ? (
          <CellDetail>{i18n._(cell.detail)}</CellDetail>
        ) : null}
      </>
    );
  }

  if (cell.kind === 'dash') {
    return (
      <CellMark>
        <CrossMark color={semanticColor.inkSubtle} sizePx={18} />
        <TierText>{i18n._(msg`No`)}</TierText>
      </CellMark>
    );
  }

  if (cell.kind === 'unlimited') {
    return (
      <CellMark>
        <InfinityMark color={color('blue')} sizePx={18} />
        <TierText>{i18n._(msg`Unlimited`)}</TierText>
      </CellMark>
    );
  }

  return (
    <CellMark>
      <TickMark color={color('blue')} sizePx={18} />
      <TierText>{i18n._(cell.label ?? msg`Yes`)}</TierText>
    </CellMark>
  );
}

function FeatureRow({
  row,
  tierColumns,
}: {
  row: PlanTableFeatureRowDataType;
  tierColumns: PlanTableTierColumnType[];
}) {
  const { i18n } = useLingui();

  return (
    <GridRow>
      <FeatureLabel>
        {i18n._(row.featureLabel)}
        {row.tooltip !== undefined ? (
          <PlanTableInfoTooltip text={row.tooltip} />
        ) : null}
      </FeatureLabel>
      {tierColumns.map((column) => (
        <TierCell
          data-highlighted={column.highlighted ? '' : undefined}
          key={column.id}
        >
          <CellValue cell={resolveCell(row, column.id)} />
        </TierCell>
      ))}
    </GridRow>
  );
}

function CategoryRow({ title }: { title: MessageDescriptor }) {
  const { i18n } = useLingui();

  return (
    <GridRow>
      <CategoryBand>
        <CategoryTitle>{i18n._(title)}</CategoryTitle>
      </CategoryBand>
      <CategoryBand aria-hidden="true" />
      <CategoryBand aria-hidden="true" />
      <CategoryBand aria-hidden="true" />
    </GridRow>
  );
}

function PlanRow({
  row,
  tierColumns,
}: {
  row: PlanTableBodyRowDataType;
  tierColumns: PlanTableTierColumnType[];
}) {
  if (row.type === 'category') {
    return <CategoryRow title={row.title} />;
  }

  return <FeatureRow row={row} tierColumns={tierColumns} />;
}

const rowKey = (row: PlanTableBodyRowDataType): string =>
  getMessageDescriptorSource(
    row.type === 'category' ? row.title : row.featureLabel,
  );

export function PlanTableContent() {
  const { i18n } = useLingui();
  const { hosting } = usePricingState();
  const [expanded, setExpanded] = useState(false);

  const visibleRows = useMemo(
    () => resolveVisibleRows(PLAN_TABLE_DATA.rows, hosting),
    [hosting],
  );

  const initialRows = visibleRows.slice(
    0,
    PLAN_TABLE_DATA.initialVisibleRowCount,
  );
  const extraRows = visibleRows.slice(PLAN_TABLE_DATA.initialVisibleRowCount);
  const hasMoreRows = extraRows.length > 0;

  const toggleLabel = expanded
    ? PLAN_TABLE_DATA.seeMoreFeaturesCta.collapseLabel
    : PLAN_TABLE_DATA.seeMoreFeaturesCta.expandLabel;

  return (
    <TableScope>
      <GridRow>
        <HeadCell>{i18n._(PLAN_TABLE_DATA.featureColumnLabel)}</HeadCell>
        {PLAN_TABLE_DATA.tierColumns.map((column) => (
          <HeadCell
            data-highlighted={column.highlighted ? '' : undefined}
            data-tier
            key={column.id}
          >
            {i18n._(column.label[hosting])}
          </HeadCell>
        ))}
      </GridRow>

      {initialRows.map((row) => (
        <PlanRow
          key={rowKey(row)}
          row={row}
          tierColumns={PLAN_TABLE_DATA.tierColumns}
        />
      ))}

      {hasMoreRows ? (
        <CollapsibleWrapper data-expanded={expanded ? '' : undefined}>
          <CollapsibleInner>
            {extraRows.map((row) => (
              <PlanRow
                key={rowKey(row)}
                row={row}
                tierColumns={PLAN_TABLE_DATA.tierColumns}
              />
            ))}
          </CollapsibleInner>
        </CollapsibleWrapper>
      ) : null}

      {hasMoreRows ? (
        <CtaRow>
          <Button
            label={i18n._(toggleLabel)}
            onClick={() => setExpanded((previous) => !previous)}
            variant="outlined"
          />
        </CtaRow>
      ) : null}
    </TableScope>
  );
}
