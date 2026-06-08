'use client';

import { styled } from '@linaria/react';
import {
  IconBrandLinkedin,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconCreativeCommonsSa,
  IconLink,
  IconList,
  IconMap2,
  IconMinus,
  IconMoneybag,
  IconPlus,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

import { getSharedCompanyLogoUrlFromDomainName } from '@/content/site/asset-paths';
import { useHorizontalDragScroll } from '@/lib/dom/use-horizontal-drag-scroll';
import { APP_PREVIEW_DATA } from '@/sections/AppPreview/app-preview.data';
import {
  type CellValue,
  type SidebarPageItemDef,
} from '@/sections/AppPreview/types/app-preview-data';

import {
  BG_DARK,
  BORDER_LIGHT,
  CARD_ACCENT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
  CARD_FONT,
} from './visual-tokens';

const HEADER_ICONS: Record<string, typeof IconLink> = {
  company: IconBuildingSkyscraper,
  url: IconLink,
  createdBy: IconCreativeCommonsSa,
  address: IconMap2,
  accountOwner: IconUserCircle,
  icp: IconTarget,
  arr: IconMoneybag,
  linkedin: IconBrandLinkedin,
  industry: IconBuildingFactory2,
  mainContact: IconUser,
  employees: IconUsers,
  opportunities: IconTargetArrow,
  added: IconCalendarEvent,
};

const SELECT_TONES: Record<string, { bg: string; color: string }> = {
  amber: { bg: 'rgba(245,158,11,0.16)', color: '#fbbf24' },
  blue: { bg: 'rgba(59,130,246,0.16)', color: '#93c5fd' },
  gray: { bg: 'rgba(255,255,255,0.08)', color: CARD_TEXT_SECONDARY },
  green: { bg: 'rgba(34,197,94,0.16)', color: '#4ade80' },
  orange: { bg: 'rgba(249,115,22,0.16)', color: '#fb923c' },
  pink: { bg: 'rgba(236,72,153,0.16)', color: '#f472b6' },
  purple: { bg: 'rgba(168,85,247,0.16)', color: '#c084fc' },
  red: { bg: 'rgba(239,68,68,0.16)', color: '#f87171' },
  teal: { bg: 'rgba(20,184,166,0.16)', color: '#5eead4' },
};

const Root = styled.div`
  background: ${BG_DARK};
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const ViewBar = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  padding: 10px 14px;
`;

const ViewIcon = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;

  svg {
    height: 15px;
    width: 15px;
  }
`;

const ViewTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 500;
`;

const ViewCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 13px;
`;

const ViewChevron = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const ViewActions = styled.div`
  color: ${CARD_TEXT_SECONDARY};
  display: flex;
  font-size: 12px;
  gap: 14px;
  margin-left: auto;
`;

const TableViewport = styled.div<{ $dragging: boolean }>`
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TableCanvas = styled.div<{ $width: number }>`
  display: flex;
  flex-direction: column;
  min-width: ${({ $width }) => `${$width}px`};
  width: ${({ $width }) => `${$width}px`};
`;

const HeaderRow = styled.div`
  animation: headerIn 260ms ease-out both;
  display: flex;

  @keyframes headerIn {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DataRow = styled.div<{ $index: number }>`
  animation: rowIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${120 + $index * 60}ms`};
  display: flex;

  @keyframes rowIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Cell = styled.div<{ $align?: string; $sticky?: boolean; $width: number }>`
  align-items: center;
  background: ${({ $sticky }) => ($sticky ? BG_DARK : 'transparent')};
  border-bottom: 1px solid ${BORDER_LIGHT};
  border-right: 1px solid ${BORDER_LIGHT};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  gap: 6px;
  height: 32px;
  justify-content: ${({ $align }) =>
    $align === 'right' ? 'flex-end' : 'flex-start'};
  left: ${({ $sticky }) => ($sticky ? '32px' : 'auto')};
  min-width: ${({ $width }) => `${$width}px`};
  overflow: hidden;
  padding: 0 8px;
  position: ${({ $sticky }) => ($sticky ? 'sticky' : 'static')};
  z-index: ${({ $sticky }) => ($sticky ? 2 : 0)};
`;

const CheckCol = styled.div`
  align-items: center;
  background: ${BG_DARK};
  border-bottom: 1px solid ${BORDER_LIGHT};
  border-right: 1px solid ${BORDER_LIGHT};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 32px;
  height: 32px;
  justify-content: center;
  left: 0;
  position: sticky;
  width: 32px;
  z-index: 2;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) => ($checked ? CARD_ACCENT : 'transparent')};
  border: 1px solid
    ${({ $checked }) => ($checked ? CARD_ACCENT : CARD_TEXT_SECONDARY)};
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;

  svg {
    height: 10px;
    width: 10px;
  }
`;

const HeaderIcon = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  flex-shrink: 0;

  svg {
    height: 16px;
    width: 16px;
  }
`;

const HeaderLabel = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderPlus = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  margin-left: auto;

  svg {
    height: 14px;
    width: 14px;
  }
`;

const Entity = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
  min-width: 0;
`;

const Logo = styled.img`
  border-radius: 4px;
  flex-shrink: 0;
  height: 16px;
  object-fit: cover;
  width: 16px;
`;

const LogoFallback = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: ${CARD_TEXT_SECONDARY};
  display: flex;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 600;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const EntityName = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LinkChip = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${BORDER_LIGHT};
  border-radius: 4px;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 12px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 1px 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Person = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
  min-width: 0;
`;

const PersonAvatar = styled.img`
  border-radius: 999px;
  flex-shrink: 0;
  height: 16px;
  object-fit: cover;
  width: 16px;
`;

const PersonFallback = styled.span`
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: ${CARD_TEXT_SECONDARY};
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 600;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const PersonName = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TextValue = styled.span`
  color: ${CARD_TEXT_SECONDARY};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NumberValue = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  white-space: nowrap;
`;

const BoolValue = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 12px;
  gap: 4px;

  svg {
    height: 14px;
    width: 14px;
  }
`;

const SelectChip = styled.span<{ $bg: string; $color: string }>`
  background: ${({ $bg }) => $bg};
  border-radius: 4px;
  color: ${({ $color }) => $color};
  font-size: 12px;
  max-width: 100%;
  overflow: hidden;
  padding: 1px 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const companiesEntry = APP_PREVIEW_DATA.visual.sidebar.workspace.find(
  (entry): entry is SidebarPageItemDef => entry.id === 'companies',
);
const companiesPage = companiesEntry?.page;
const TABLE = companiesPage?.type === 'table' ? companiesPage : null;

function Cells({ cell }: { cell: CellValue }) {
  switch (cell.type) {
    case 'entity': {
      const logoUrl = getSharedCompanyLogoUrlFromDomainName(cell.domain);
      return (
        <Entity>
          {logoUrl ? (
            <Logo alt="" src={logoUrl} />
          ) : (
            <LogoFallback>{cell.name[0]}</LogoFallback>
          )}
          <EntityName>{cell.name}</EntityName>
        </Entity>
      );
    }
    case 'link':
      return <LinkChip>{cell.value}</LinkChip>;
    case 'person':
      return (
        <Person>
          {cell.avatarUrl ? (
            <PersonAvatar alt="" src={cell.avatarUrl} />
          ) : (
            <PersonFallback>{cell.shortLabel ?? cell.name[0]}</PersonFallback>
          )}
          <PersonName>{cell.name}</PersonName>
        </Person>
      );
    case 'text':
      return <TextValue>{cell.value}</TextValue>;
    case 'number':
    case 'currency':
      return <NumberValue>{cell.value}</NumberValue>;
    case 'boolean':
      return (
        <BoolValue>
          {cell.value ? <IconCheck /> : <IconX />}
          {cell.value ? 'True' : 'False'}
        </BoolValue>
      );
    case 'select': {
      const tone = SELECT_TONES[cell.color ?? 'gray'] ?? SELECT_TONES.gray;
      return (
        <SelectChip $bg={tone.bg} $color={tone.color}>
          {cell.value}
        </SelectChip>
      );
    }
    case 'relation':
      return (
        <>
          {cell.items.map((item) => {
            const tone = SELECT_TONES[item.tone ?? 'gray'] ?? SELECT_TONES.gray;
            return (
              <SelectChip $bg={tone.bg} $color={tone.color} key={item.name}>
                {item.name}
              </SelectChip>
            );
          })}
        </>
      );
    default:
      return null;
  }
}

type ContactsVisualProps = {
  active: boolean;
};

export function ContactsVisual({ active: _active }: ContactsVisualProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  } = useHorizontalDragScroll<HTMLDivElement>();

  if (!TABLE) {
    return null;
  }

  const columns = TABLE.columns;
  const rows = TABLE.rows;
  const totalWidth =
    columns.reduce((sum, column) => sum + column.width, 0) + 32;

  const selectedCount = rows.filter((_, index) => checked[index]).length;
  const allChecked = rows.length > 0 && selectedCount === rows.length;
  const someChecked = selectedCount > 0;

  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
      return;
    }
    const next: Record<number, boolean> = {};
    rows.forEach((_, index) => {
      next[index] = true;
    });
    setChecked(next);
  };

  return (
    <Root>
      <ViewBar>
        <ViewIcon>
          <IconList />
        </ViewIcon>
        <ViewTitle>{TABLE.header.title}</ViewTitle>
        <ViewCount>· {TABLE.header.count}</ViewCount>
        <ViewChevron>
          <IconChevronDown />
        </ViewChevron>
        <ViewActions>
          <span>Filter</span>
          <span>Sort</span>
          <span>Options</span>
        </ViewActions>
      </ViewBar>

      <TableViewport
        ref={viewportRef}
        $dragging={dragging}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <TableCanvas $width={totalWidth}>
          <HeaderRow>
            <CheckCol>
              <CheckboxBox
                $checked={someChecked}
                onClick={toggleAll}
                onPointerDown={(event) => event.stopPropagation()}
              >
                {allChecked ? <IconCheck /> : null}
                {someChecked && !allChecked ? <IconMinus /> : null}
              </CheckboxBox>
            </CheckCol>
            {columns.map((column) => {
              const Icon = HEADER_ICONS[column.id] ?? IconList;
              return (
                <Cell
                  key={column.id}
                  $sticky={column.isFirstColumn}
                  $width={column.width}
                >
                  <HeaderIcon>
                    <Icon />
                  </HeaderIcon>
                  <HeaderLabel>{column.label}</HeaderLabel>
                  {column.isFirstColumn ? (
                    <HeaderPlus>
                      <IconPlus />
                    </HeaderPlus>
                  ) : null}
                </Cell>
              );
            })}
          </HeaderRow>

          {rows.map((row, index) => (
            <DataRow key={row.id} $index={index}>
              <CheckCol>
                <CheckboxBox
                  $checked={Boolean(checked[index])}
                  onClick={() =>
                    setChecked((prev) => ({ ...prev, [index]: !prev[index] }))
                  }
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {checked[index] ? <IconCheck /> : null}
                </CheckboxBox>
              </CheckCol>
              {columns.map((column) => {
                const cell = row.cells[column.id];
                return (
                  <Cell
                    key={column.id}
                    $align={column.align}
                    $sticky={column.isFirstColumn}
                    $width={column.width}
                  >
                    {cell ? <Cells cell={cell} /> : null}
                  </Cell>
                );
              })}
            </DataRow>
          ))}
        </TableCanvas>
      </TableViewport>
    </Root>
  );
}
