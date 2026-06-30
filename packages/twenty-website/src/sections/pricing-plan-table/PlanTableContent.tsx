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

import { PLAN_TABLE_DATA } from './plan-table-data';
import {
  type PlanTableBodyRowDataType,
  type PlanTableCellType,
  type PlanTableFeatureRowDataType,
  type PlanTableTierColumnType,
} from './plan-table-types';
import { resolveVisibleRows } from './plan-table-visible-rows';

const CheckMark = INFORMATIVE_MARKS.check;

const TableScope = styled.div`
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

const FeatureLabel = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: ${spacing(8)};
  min-height: ${spacing(16)};
  padding: ${spacing(4)};
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
`;

const TierText = styled.span`
  color: ${semanticColor.ink};
`;

const YesRow = styled.div`
  align-items: center;
  column-gap: ${spacing(4)};
  display: flex;
  width: 100%;
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
    opacity 0.4s ${EASING.standard};
  width: 100%;

  &[data-expanded] {
    grid-template-rows: 1fr;
    opacity: 1;
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

function CellValue({ cell }: { cell: PlanTableCellType }) {
  const { i18n } = useLingui();

  if (cell.kind === 'dash') {
    return <TierText>{i18n._(msg`No`)}</TierText>;
  }

  if (cell.kind === 'text') {
    return <TierText>{i18n._(cell.text)}</TierText>;
  }

  return (
    <YesRow>
      <CheckMark color={color('blue')} sizePx={16} />
      <TierText>{i18n._(cell.label ?? msg`Yes`)}</TierText>
    </YesRow>
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
      <FeatureLabel>{i18n._(row.featureLabel)}</FeatureLabel>
      {tierColumns.map((column) => (
        <TierCell key={column.id}>
          <CellValue cell={row.tiers[column.id]} />
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
          <HeadCell data-tier key={column.id}>
            {i18n._(column.label)}
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
