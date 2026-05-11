'use client';

import { useHorizontalDragScroll } from '@/lib/dom/use-horizontal-drag-scroll';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useState } from 'react';
import type { TablePageDefinition } from '../../types';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { MiniIcon } from '../../Shared/components/MiniIcon';
import { TablePageCheckbox } from './TablePageCheckbox';
import { renderTableCellValue } from './TablePageCellValue';
import { renderTableHeaderIcon } from './render-table-header-icon';
import {
  TABLE_PAGE_CELL_HORIZONTAL_PADDING,
  TABLE_PAGE_COLORS,
  TABLE_PAGE_FONT,
} from './table-page-theme';

const APP_FONT = TABLE_PAGE_FONT;
const COLORS = TABLE_PAGE_COLORS;
const TABLE_CELL_HORIZONTAL_PADDING = TABLE_PAGE_CELL_HORIZONTAL_PADDING;

const TableShell = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const GripRail = styled.div`
  background: ${COLORS.background};
  display: grid;
  flex: 0 0 12px;
  grid-auto-rows: 32px;
  width: 12px;
`;

const GripCell = styled.div`
  background: ${COLORS.background};
  border-bottom: 1px solid ${COLORS.borderLight};
`;

const TableViewport = styled.div<{ $dragging: boolean }>`
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TableCanvas = styled.div<{ $width: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  min-width: ${({ $width }) => `${$width}px`};
  width: ${({ $width }) => `${$width}px`};
`;

const HeaderRow = styled.div`
  animation: tableHeaderAppear 260ms ease-out both;
  display: flex;

  @keyframes tableHeaderAppear {
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

const DataRow = styled.div<{ $rowIndex: number }>`
  animation: tableRowAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $rowIndex }) => `${120 + $rowIndex * 70}ms`};
  display: flex;

  @keyframes tableRowAppear {
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

const FooterRow = styled.div`
  display: flex;
`;

const TableCell = styled.div<{
  $align?: 'left' | 'right';
  $header?: boolean;
  $hovered?: boolean;
  $sticky?: boolean;
  $width: number;
}>`
  align-items: center;
  background: ${({ $header, $hovered }) => {
    if ($header) {
      return COLORS.background;
    }

    return $hovered ? COLORS.backgroundSecondary : COLORS.background;
  }};
  border-bottom: 1px solid ${COLORS.borderLight};
  border-right: 1px solid ${COLORS.borderLight};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: 32px;
  justify-content: ${({ $align }) =>
    $align === 'right' ? 'flex-end' : 'flex-start'};
  left: ${({ $sticky }) => ($sticky ? '0' : 'auto')};
  min-width: ${({ $width }) => `${$width}px`};
  padding: 0 ${TABLE_CELL_HORIZONTAL_PADDING}px;
  position: ${({ $sticky }) => ($sticky ? 'sticky' : 'relative')};
  z-index: ${({ $header, $sticky }) => {
    if ($sticky && $header) {
      return 6;
    }

    if ($sticky) {
      return 4;
    }

    return 1;
  }};
`;

const EmptyFillCell = styled.div<{
  $footer?: boolean;
  $header?: boolean;
  $hovered?: boolean;
  $width: number;
}>`
  background: ${({ $header, $hovered, $footer }) => {
    if ($header || $footer) {
      return COLORS.background;
    }

    return $hovered ? COLORS.backgroundSecondary : COLORS.background;
  }};
  border-bottom: 1px solid ${COLORS.borderLight};
  flex: 0 0 ${({ $width }) => `${$width}px`};
  min-width: ${({ $width }) => `${$width}px`};
`;

const HeaderCellContent = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

const HeaderLabel = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EdgePlus = styled.div`
  margin-left: auto;
`;

const MutedText = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  white-space: nowrap;
`;

const FooterFirstContent = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  padding-left: 28px;
`;

const HeaderFillContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  padding: 0 8px;
`;

export function TablePage({
  page,
  onNavigateToLabel,
}: {
  page: TablePageDefinition;
  onNavigateToLabel?: (label: string) => void;
}) {
  const {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  } = useHorizontalDragScroll<HTMLDivElement>();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const columnWidth = page.columns.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  const totalTableWidth = page.width ?? columnWidth;
  const fillerWidth = Math.max(totalTableWidth - columnWidth, 0);

  return (
    <TableShell>
      <GripRail aria-hidden="true">
        <GripCell />
        {page.rows.map((row) => (
          <GripCell key={`grip-${row.id}`} />
        ))}
        <GripCell />
      </GripRail>

      <TableViewport
        ref={viewportRef}
        $dragging={dragging}
        aria-label={`Interactive preview of the ${page.header.title} table`}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <TableCanvas $width={totalTableWidth}>
          <HeaderRow>
            {page.columns.map((column) => (
              <TableCell
                key={column.id}
                $align={column.align}
                $header
                $sticky={column.isFirstColumn}
                $width={column.width}
              >
                <HeaderCellContent>
                  {column.isFirstColumn ? (
                    <>
                      <TablePageCheckbox />
                      {renderTableHeaderIcon(column.id)}
                      <HeaderLabel>{column.label}</HeaderLabel>
                      <EdgePlus aria-hidden="true">
                        <MiniIcon
                          icon={IconPlus}
                          color={COLORS.textTertiary}
                          size={12}
                        />
                      </EdgePlus>
                    </>
                  ) : (
                    <>
                      {renderTableHeaderIcon(column.id)}
                      <HeaderLabel>{column.label}</HeaderLabel>
                    </>
                  )}
                </HeaderCellContent>
              </TableCell>
            ))}
            <EmptyFillCell $header $width={fillerWidth}>
              {fillerWidth > 0 ? (
                <HeaderFillContent>
                  <MiniIcon
                    icon={IconPlus}
                    color={COLORS.textTertiary}
                    size={16}
                  />
                </HeaderFillContent>
              ) : null}
            </EmptyFillCell>
          </HeaderRow>

          {page.rows.map((row, rowIndex) => {
            const hovered = hoveredRowId === row.id;

            return (
              <DataRow
                key={row.id}
                $rowIndex={rowIndex}
                onMouseEnter={() => setHoveredRowId(row.id)}
                onMouseLeave={() =>
                  setHoveredRowId((current) =>
                    current === row.id ? null : current,
                  )
                }
              >
                {page.columns.map((column) => {
                  const cell = row.cells[column.id];

                  return (
                    <TableCell
                      key={`${row.id}-${column.id}`}
                      $align={column.align}
                      $hovered={hovered}
                      $sticky={column.isFirstColumn}
                      $width={column.width}
                    >
                      {cell
                        ? renderTableCellValue({
                            cell,
                            columnId: column.id,
                            hovered,
                            isFirstColumn: !!column.isFirstColumn,
                            onNavigateToLabel,
                          })
                        : null}
                    </TableCell>
                  );
                })}
                <EmptyFillCell $hovered={hovered} $width={fillerWidth} />
              </DataRow>
            );
          })}

          <FooterRow>
            {page.columns.length > 0 ? (
              <TableCell
                $sticky={page.columns[0].isFirstColumn}
                $width={page.columns[0].width}
              >
                <FooterFirstContent>
                  <MutedText>Calculate</MutedText>
                  <MiniIcon
                    icon={IconChevronDown}
                    color={COLORS.textTertiary}
                  />
                </FooterFirstContent>
              </TableCell>
            ) : null}
            {page.columns.slice(1).map((column) => (
              <TableCell
                key={`footer-${column.id}`}
                $align={column.align}
                $width={column.width}
              />
            ))}
            <EmptyFillCell $footer $width={fillerWidth} />
          </FooterRow>
        </TableCanvas>
      </TableViewport>
    </TableShell>
  );
}
