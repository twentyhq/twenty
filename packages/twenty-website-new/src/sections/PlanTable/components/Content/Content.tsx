import { LinkButton } from '@/design-system/components';
import { CheckIcon } from '@/icons';
import type {
  PlanTableCellType,
  PlanTableDataType,
  PlanTableFeatureRowDataType,
  PlanTableTierColumnType,
} from '@/sections/PlanTable/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { CalculatorEmbed } from '../CalculatorEmbed/CalculatorEmbed';

const TableScope = styled.div`
  align-items: center;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
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

const CtaRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

type CellValueProps = {
  cell: PlanTableCellType;
};

function CellValue({ cell }: CellValueProps) {
  if (cell.kind === 'dash') {
    return <TierText>—</TierText>;
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
  return (
    <TableScope>
      <GridRow>
        <HeadFeature>{data.featureColumnLabel}</HeadFeature>
        {data.tierColumns.map((column) => (
          <HeadTier key={column.id}>{column.label}</HeadTier>
        ))}
      </GridRow>

      {data.rows.map((row, rowIndex) => {
        if (row.type === 'category') {
          return (
            <CategoryRow
              key={`${row.title}-${rowIndex}`}
              title={row.title}
            />
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
      })}

      <CtaRow>
        <LinkButton
          color="secondary"
          href={data.seeMoreFeaturesCta.href}
          label={data.seeMoreFeaturesCta.label}
          type="link"
          variant="outlined"
        />
      </CtaRow>
    </TableScope>
  );
}
