import { styled } from '@linaria/react';
import { IconCheck, IconCopy, IconPencil, IconX } from '@tabler/icons-react';
import { type ReactNode } from 'react';

import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';

import { TableCheckbox } from './table-checkbox';
import { Chip, type ChipVariant } from '../../primitives/chip';
import { FaviconLogo } from '../../primitives/favicon-logo';
import { getInitials } from '../../primitives/get-initials';
import { MiniIcon } from '../../primitives/mini-icon';
import { PersonAvatar } from '../../primitives/person-avatar';
import { PreviewAvatar } from '../../primitives/preview-avatar';
import { PreviewRoundedLink } from '../../primitives/preview-rounded-link';
import { PreviewTag } from '../../primitives/preview-tag';
import {
  type CellEntity,
  type CellLink,
  type CellPerson,
  type CellRelation,
  type CellText,
  type CellValue,
} from '../../types';

// The floating row action sits over the cell's right padding.
const CELL_HORIZONTAL_PADDING = 8;
const HOVER_ACTION_EDGE_INSET = 4;
const ROW_HOVER_ACTION_DISABLED_COLUMNS = new Set([
  'createdBy',
  'accountOwner',
]);

const FirstColumnCellLayout = styled.div`
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

const InlineText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
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

const HoverActions = styled.div<{ $visible: boolean }>`
  align-items: center;
  background: ${THEME_LIGHT.background.transparent.primary};
  border: 1px solid ${THEME_LIGHT.background.transparent.light};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  bottom: 4px;
  box-sizing: border-box;
  box-shadow: ${THEME_LIGHT.boxShadow.light};
  display: flex;
  gap: 0;
  justify-content: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  padding: 0 4px;
  pointer-events: none;
  position: absolute;
  right: ${HOVER_ACTION_EDGE_INSET - CELL_HORIZONTAL_PADDING}px;
  top: 4px;
  transform: translateX(${({ $visible }) => ($visible ? '0' : '4px')});
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
  width: 24px;
`;

const MiniAction = styled.div`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.xs};
  color: ${THEME_LIGHT.font.color.secondary};
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const MultiChipStack = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

function HoverAction({
  icon,
  visible,
}: {
  icon: typeof IconCopy;
  visible: boolean;
}) {
  return (
    <HoverActions $visible={visible}>
      <MiniAction aria-hidden>
        <MiniIcon icon={icon} color={THEME_LIGHT.font.color.secondary} />
      </MiniAction>
    </HoverActions>
  );
}

function PersonTokenCell({
  isFirstColumn = false,
  token,
  hovered = false,
  variant = 'highlighted',
}: {
  hovered?: boolean;
  isFirstColumn?: boolean;
  token: CellPerson;
  variant?: ChipVariant;
}) {
  const content = (
    <Chip
      clickable={false}
      label={token.name}
      leftComponent={<PersonAvatar person={token} />}
      variant={variant}
    />
  );
  if (isFirstColumn) {
    return (
      <FirstColumnCellLayout>
        <TableCheckbox />
        {content}
        <HoverAction icon={IconCopy} visible={hovered} />
      </FirstColumnCellLayout>
    );
  }
  return (
    <CellHoverAnchor>
      {content}
      <HoverAction icon={IconCopy} visible={hovered} />
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
  const content = (
    <Chip
      clickable={false}
      label={cell.name}
      leftComponent={<FaviconLogo domain={cell.domain} label={cell.name} />}
      variant="highlighted"
    />
  );
  if (isFirstColumn) {
    return (
      <FirstColumnCellLayout>
        <TableCheckbox />
        {content}
        <HoverAction icon={IconPencil} visible={hovered} />
      </FirstColumnCellLayout>
    );
  }
  return (
    <CellHoverAnchor>
      {content}
      <HoverAction icon={IconPencil} visible={hovered} />
    </CellHoverAnchor>
  );
}

function RelationCellComponent({ cell }: { cell: CellRelation }) {
  return (
    <CellHoverAnchor>
      <MultiChipStack>
        {cell.items.map((item) => (
          <Chip
            key={item.name}
            clickable={false}
            label={item.name}
            leftComponent={
              <PreviewAvatar tone={item.tone}>
                {item.shortLabel ?? getInitials(item.name)}
              </PreviewAvatar>
            }
            variant="highlighted"
          />
        ))}
      </MultiChipStack>
    </CellHoverAnchor>
  );
}

function TextCellComponent({
  cell,
  isFirstColumn,
}: {
  cell: CellText;
  isFirstColumn: boolean;
}) {
  if (!isFirstColumn) {
    return <InlineText>{cell.value}</InlineText>;
  }
  const content = cell.shortLabel ? (
    <Chip
      clickable={false}
      label={cell.value}
      leftComponent={
        <PreviewAvatar tone={cell.tone}>{cell.shortLabel}</PreviewAvatar>
      }
      variant="highlighted"
    />
  ) : (
    <Chip clickable={false} label={cell.value} variant="highlighted" />
  );
  return (
    <FirstColumnCellLayout>
      <TableCheckbox />
      {content}
    </FirstColumnCellLayout>
  );
}

function LinkCellComponent({ cell }: { cell: CellLink }) {
  const label =
    cell.label ??
    (cell.kind === 'social' && cell.value.startsWith('@')
      ? cell.value
      : cell.value);
  return (
    <CellHoverAnchor>
      <PreviewRoundedLink label={label} />
    </CellHoverAnchor>
  );
}

export function renderTableCellValue({
  cell,
  columnId,
  hovered,
  isFirstColumn,
}: {
  cell: CellValue;
  columnId: string;
  hovered: boolean;
  isFirstColumn: boolean;
}): ReactNode {
  const showHoverAction = !ROW_HOVER_ACTION_DISABLED_COLUMNS.has(columnId);
  const personChipVariant: ChipVariant =
    columnId === 'createdBy' ? 'transparent' : 'highlighted';

  switch (cell.type) {
    case 'text':
      return <TextCellComponent cell={cell} isFirstColumn={isFirstColumn} />;
    case 'number':
      return <RightAlignedText>{cell.value}</RightAlignedText>;
    case 'currency':
      return <RightAlignedText>{cell.value}</RightAlignedText>;
    case 'link':
      return <LinkCellComponent cell={cell} />;
    case 'boolean':
      return (
        <BooleanRow>
          {cell.value ? (
            <MiniIcon
              icon={IconCheck}
              color={THEME_LIGHT.font.color.primary}
              size={11}
            />
          ) : (
            <MiniIcon
              icon={IconX}
              color={THEME_LIGHT.font.color.primary}
              size={11}
            />
          )}
          <InlineText>{cell.value ? 'True' : 'False'}</InlineText>
        </BooleanRow>
      );
    case 'select':
      return <PreviewTag color={cell.color} label={cell.value} />;
    case 'person':
      return (
        <PersonTokenCell
          hovered={hovered && showHoverAction}
          isFirstColumn={isFirstColumn}
          token={cell}
          variant={personChipVariant}
        />
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
      return <RelationCellComponent cell={cell} />;
  }
}
