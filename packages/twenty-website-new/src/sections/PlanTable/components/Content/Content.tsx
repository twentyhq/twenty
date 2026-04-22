'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { CheckIcon } from '@/icons';
import { usePricingState } from '@/sections/Plans/context/PricingStateContext';
import type {
  PlanTableBodyRowDataType,
  PlanTableCellType,
  PlanTableDataType,
  PlanTableFeatureRowDataType,
  PlanTableTierColumnType,
} from '@/sections/PlanTable/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { CalculatorEmbed } from '../CalculatorEmbed/CalculatorEmbed';

const TableScope = styled.div`
  align-items: center;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
`;

const HeadFeature = styled.div`
  border-bottom: 1px solid ${theme.colors.secondary.border[10]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5.5)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.spacing(7)};
  padding: ${theme.spacing(4)};
`;

const HeadTier = styled.div`
  border-bottom: 1px solid ${theme.colors.secondary.border[10]};
  border-left: 1px solid ${theme.colors.secondary.border[10]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5.5)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.spacing(7)};
  padding: ${theme.spacing(4)};
`;

const FeatureLabel = styled.div`
  border-bottom: 1px solid ${theme.colors.secondary.border[10]};
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: ${theme.spacing(8)};
  min-height: ${theme.spacing(16)};
  padding: ${theme.spacing(4)};
`;

const TierCell = styled.div`
  border-bottom: 1px solid ${theme.colors.secondary.border[10]};
  border-left: 1px solid ${theme.colors.secondary.border[10]};
  display: flex;
  flex-direction: column;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  justify-content: center;
  line-height: ${theme.spacing(5.5)};
  min-height: ${theme.spacing(16)};
  padding: ${theme.spacing(4)};
`;

const TierText = styled.span`
  color: ${theme.colors.secondary.text[100]};
`;

const YesRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(4)};
  width: 100%;
`;

const CategoryBand = styled.div`
  align-items: center;
  background-color: ${theme.colors.secondary.border[10]};
  display: flex;
  min-height: ${theme.spacing(16)};
  padding: ${theme.spacing(2)} ${theme.spacing(4)};
`;

const CategoryTitle = styled.span`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5.5)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.spacing(7)};
  width: 100%;
`;

const CollapsibleWrapper = styled.div`
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.4s ease,
    opacity 0.4s ease;
  width: 100%;

  &[data-expanded='true'] {
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
  margin-top: ${theme.spacing(10)};
  width: 100%;
`;

const ToggleButton = styled.button`
  ${buttonBaseStyles}
`;

type CellValueProps = {
  cell: PlanTableCellType;
};

function CellValue({ cell }: CellValueProps) {
  if (cell.kind === 'dash') {
    return <TierText>No</TierText>;
  }

  if (cell.kind === 'text') {
    return <TierText>{cell.text}</TierText>;
  }

  const label = cell.label ?? 'Yes';

  return (
    <YesRow>
      <CheckIcon color={theme.colors.highlight[100]} size={16} />
      <TierText>{label}</TierText>
    </YesRow>
  );
}

function resolveVisibleRows(
  rows: PlanTableBodyRowDataType[],
  hosting: 'cloud' | 'selfHost',
): PlanTableBodyRowDataType[] {
  const scoped = rows.flatMap((row) => {
    if (
      row.type !== 'calculator' &&
      row.appliesTo &&
      row.appliesTo !== hosting
    ) {
      return [];
    }

    if (row.type === 'row' && hosting === 'selfHost' && row.selfHostTiers) {
      return [{ ...row, tiers: row.selfHostTiers }];
    }

    return [row];
  });

  return scoped.filter((row, index) => {
    if (row.type !== 'category') {
      return true;
    }

    const next = scoped.slice(index + 1).find((candidate) => {
      return candidate.type === 'category' || candidate.type === 'row';
    });

    return next !== undefined && next.type !== 'category';
  });
}

type FeatureRowProps = {
  row: PlanTableFeatureRowDataType;
  tierColumns: PlanTableTierColumnType[];
};

function FeatureRow({ row, tierColumns }: FeatureRowProps) {
  return (
    <GridRow>
      <FeatureLabel>{row.featureLabel}</FeatureLabel>
      {tierColumns.map((column) => (
        <TierCell key={column.id}>
          <CellValue cell={row.tiers[column.id]} />
        </TierCell>
      ))}
    </GridRow>
  );
}

type CategoryRowProps = {
  title: string;
};

function CategoryRow({ title }: CategoryRowProps) {
  return (
    <GridRow>
      <CategoryBand>
        <CategoryTitle>{title}</CategoryTitle>
      </CategoryBand>
      <CategoryBand aria-hidden="true" />
      <CategoryBand aria-hidden="true" />
    </GridRow>
  );
}

type ContentProps = {
  data: PlanTableDataType;
};

export function Content({ data }: ContentProps) {
  const [expanded, setExpanded] = useState(false);
  const { hosting } = usePricingState();

  const visibleRows = useMemo(
    () => resolveVisibleRows(data.rows, hosting),
    [data.rows, hosting],
  );

  const initialRows = visibleRows.slice(0, data.initialVisibleRowCount);
  const extraRows = visibleRows.slice(data.initialVisibleRowCount);
  const hasMoreRows = extraRows.length > 0;

  const toggleLabel = expanded
    ? data.seeMoreFeaturesCta.collapseLabel
    : data.seeMoreFeaturesCta.expandLabel;

  const mapRows = (rows: PlanTableDataType['rows'], startIndex: number) =>
    rows.map((row, index) => {
      const rowIndex = startIndex + index;

      if (row.type === 'category') {
        return (
          <CategoryRow key={`${row.title}-${rowIndex}`} title={row.title} />
        );
      }

      if (row.type === 'calculator') {
        return (
          <CalculatorEmbed
            calculator={row.calculator}
            key={`calculator-${rowIndex}`}
          />
        );
      }

      return (
        <FeatureRow
          key={`${row.featureLabel}-${rowIndex}`}
          row={row}
          tierColumns={data.tierColumns}
        />
      );
    });

  return (
    <TableScope>
      <GridRow>
        <HeadFeature>{data.featureColumnLabel}</HeadFeature>
        {data.tierColumns.map((column) => (
          <HeadTier key={column.id}>{column.label}</HeadTier>
        ))}
      </GridRow>

      {mapRows(initialRows, 0)}

      {hasMoreRows && (
        <CollapsibleWrapper data-expanded={String(expanded)}>
          <CollapsibleInner>
            {mapRows(extraRows, data.initialVisibleRowCount)}
          </CollapsibleInner>
        </CollapsibleWrapper>
      )}

      {hasMoreRows && (
        <CtaRow>
          <ToggleButton
            data-color="primary"
            data-variant="outlined"
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <BaseButton
              color="primary"
              label={toggleLabel}
              variant="outlined"
            />
          </ToggleButton>
        </CtaRow>
      )}
    </TableScope>
  );
}
