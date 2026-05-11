import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import type {
  CellEntity,
  CellPerson,
  CellRelation,
  CellText,
  CellValue,
} from '../../types';
import { getInitials } from '../../Shared/utils/get-initials';
import { PreviewAvatar } from '../../Shared/components/PreviewAvatar';
import { FaviconLogo } from '../../Shared/components/FaviconLogo';
import { PersonAvatar } from '../../Shared/components/PersonAvatar';
import { ChipVariant } from '../../Shared/utils/chip-variant';
import { Chip } from '../../Shared/components/Chip';
import { VISUAL_TOKENS } from '../../Shared/utils/app-preview-tokens';
import { IconCheck, IconCopy, IconPencil, IconX } from '@tabler/icons-react';
import { MiniIcon } from '../../Shared/components/MiniIcon';
import { TablePageCheckbox } from './TablePageCheckbox';
import {
  TABLE_PAGE_CELL_HORIZONTAL_PADDING,
  TABLE_PAGE_COLORS,
  TABLE_PAGE_FONT,
  TABLE_PAGE_HOVER_ACTION_EDGE_INSET,
} from './table-page-theme';

const ROW_HOVER_ACTION_DISABLED_COLUMNS = new Set([
  'createdBy',
  'accountOwner',
]);

const EntityCellLayout = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 100%;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const CellHoverAnchor = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const CellChip = styled(Chip)`
  max-width: 100%;
  min-width: 0;
`;

const InlineText = styled.span`
  color: ${TABLE_PAGE_COLORS.text};
  font-family: ${TABLE_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RightAlignedText = styled(InlineText)`
  text-align: right;
  width: 100%;
`;

const BooleanRow = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const HoverActions = styled.div<{ $rightInset?: number; $visible: boolean }>`
  align-items: center;
  background: ${VISUAL_TOKENS.background.transparent.primary};
  border: 1px solid ${VISUAL_TOKENS.background.transparent.light};
  border-radius: 4px;
  bottom: 4px;
  box-sizing: border-box;
  box-shadow: ${VISUAL_TOKENS.boxShadow.light};
  display: flex;
  gap: 0;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  padding: 0 4px;
  pointer-events: none;
  position: absolute;
  right: ${({
    $rightInset = TABLE_PAGE_HOVER_ACTION_EDGE_INSET -
      TABLE_PAGE_CELL_HORIZONTAL_PADDING,
  }) => `${$rightInset}px`};
  top: 4px;
  transform: translateX(${({ $visible }) => ($visible ? '0' : '4px')});
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
  width: 24px;
`;

const MiniAction = styled.div`
  align-items: center;
  border-radius: 2px;
  color: ${TABLE_PAGE_COLORS.textSecondary};
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const TagChip = styled.div`
  align-items: center;
  background: ${VISUAL_TOKENS.background.transparent.light};
  border-radius: 4px;
  color: ${TABLE_PAGE_COLORS.textSecondary};
  display: inline-flex;
  font-family: ${TABLE_PAGE_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  height: 20px;
  line-height: 1.4;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MultiChipStack = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

function PersonTokenCell({
  token,
  hovered = false,
  withCopyAction = true,
}: {
  hovered?: boolean;
  token: CellPerson;
  withCopyAction?: boolean;
}) {
  return (
    <CellHoverAnchor>
      <CellChip
        clickable={false}
        label={token.name}
        leftComponent={<PersonAvatar person={token} />}
      />
      <HoverActions $visible={hovered}>
        {withCopyAction ? (
          <MiniAction aria-hidden="true">
            <MiniIcon icon={IconCopy} color={TABLE_PAGE_COLORS.textSecondary} />
          </MiniAction>
        ) : null}
      </HoverActions>
    </CellHoverAnchor>
  );
}

function EntityCellComponent({
  cell,
  hovered,
  isFirstColumn,
}: {
  cell: CellEntity;
  hovered: boolean;
  isFirstColumn: boolean;
}) {
  if (isFirstColumn) {
    return (
      <EntityCellLayout>
        <TablePageCheckbox />
        <CellChip
          clickable={false}
          label={cell.name}
          leftComponent={<FaviconLogo domain={cell.domain} label={cell.name} />}
          variant={ChipVariant.Highlighted}
        />
        <HoverActions $visible={hovered}>
          <MiniAction aria-hidden="true">
            <MiniIcon
              icon={IconPencil}
              color={TABLE_PAGE_COLORS.textSecondary}
            />
          </MiniAction>
        </HoverActions>
      </EntityCellLayout>
    );
  }

  return (
    <CellChip
      clickable={false}
      label={cell.name}
      leftComponent={<FaviconLogo domain={cell.domain} label={cell.name} />}
    />
  );
}

function RelationCellComponent({
  cell,
  hovered,
}: {
  cell: CellRelation;
  hovered: boolean;
}) {
  return (
    <CellHoverAnchor>
      <MultiChipStack>
        {cell.items.map((item) => (
          <CellChip
            key={item.name}
            clickable={false}
            label={item.name}
            leftComponent={
              <PreviewAvatar tone={item.tone}>
                {item.shortLabel ?? getInitials(item.name)}
              </PreviewAvatar>
            }
          />
        ))}
      </MultiChipStack>
      <HoverActions $visible={hovered}>
        <MiniAction aria-hidden="true">
          <MiniIcon icon={IconCopy} color={TABLE_PAGE_COLORS.textSecondary} />
        </MiniAction>
      </HoverActions>
    </CellHoverAnchor>
  );
}

function TextCellComponent({
  cell,
  isFirstColumn,
  onNavigateToLabel,
}: {
  cell: CellText;
  isFirstColumn: boolean;
  onNavigateToLabel?: (label: string) => void;
}) {
  const targetLabel = cell.targetLabel;
  const handleNavigate =
    targetLabel && onNavigateToLabel
      ? () => onNavigateToLabel(targetLabel)
      : undefined;

  if (!isFirstColumn || !cell.shortLabel) {
    return <InlineText>{cell.value}</InlineText>;
  }

  return (
    <CellChip
      clickable={handleNavigate !== undefined}
      label={cell.value}
      leftComponent={
        <PreviewAvatar tone={cell.tone}>{cell.shortLabel}</PreviewAvatar>
      }
      onClick={handleNavigate}
    />
  );
}

export function renderTableCellValue({
  cell,
  columnId,
  hovered,
  isFirstColumn,
  onNavigateToLabel,
}: {
  cell: CellValue;
  columnId: string;
  hovered: boolean;
  isFirstColumn: boolean;
  onNavigateToLabel?: (label: string) => void;
}): ReactNode {
  const showHoverAction = !ROW_HOVER_ACTION_DISABLED_COLUMNS.has(columnId);

  switch (cell.type) {
    case 'text':
      return (
        <TextCellComponent
          cell={cell}
          isFirstColumn={isFirstColumn}
          onNavigateToLabel={onNavigateToLabel}
        />
      );
    case 'number':
      return <RightAlignedText>{cell.value}</RightAlignedText>;
    case 'link':
      return (
        <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
          <CellChip
            clickable={false}
            label={cell.value}
            variant={ChipVariant.Static}
          />
        </div>
      );
    case 'boolean':
      return (
        <BooleanRow>
          {cell.value ? (
            <MiniIcon
              icon={IconCheck}
              color={TABLE_PAGE_COLORS.text}
              size={11}
            />
          ) : (
            <MiniIcon icon={IconX} color={TABLE_PAGE_COLORS.text} size={11} />
          )}
          <InlineText>{cell.value ? 'True' : 'False'}</InlineText>
        </BooleanRow>
      );
    case 'tag':
      return <TagChip>{cell.value}</TagChip>;
    case 'person':
      return (
        <PersonTokenCell hovered={hovered && showHoverAction} token={cell} />
      );
    case 'entity':
      return (
        <EntityCellComponent
          cell={cell}
          hovered={hovered && showHoverAction}
          isFirstColumn={isFirstColumn}
        />
      );
    case 'relation':
      return (
        <RelationCellComponent
          cell={cell}
          hovered={hovered && showHoverAction}
        />
      );
  }
}
