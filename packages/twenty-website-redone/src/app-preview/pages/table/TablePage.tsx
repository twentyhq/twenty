'use client';

import { styled } from '@linaria/react';

import { EASING } from '@/tokens';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

import { THEME_LIGHT } from 'twenty-ui/theme';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { APP_PREVIEW_CHROME } from '@/app-preview/app-preview-chrome';

import { renderTableCellValue } from './TableCellValue';
import { TableCheckbox } from './TableCheckbox';
import { renderTableHeaderIcon } from './TableHeaderIcon';
import { MiniIcon } from '../../primitives/MiniIcon';
import { PREVIEW_SKELETON } from '../../primitives/PreviewSkeleton';
import { useHorizontalDragScroll } from '@/platform/motion';
import { type TablePageDefinition } from '../../types';

const CELL_HORIZONTAL_PADDING = 8;

const TableShell = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
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
  animation: tableRowAppear 420ms ${EASING.standard} both;
  animation-delay: ${({ $rowIndex }) => `${120 + $rowIndex * 70}ms`};
  display: flex;
  max-height: 0;
  /* Axis-split clip: the reveal animation clips VERTICALLY only. Unlike
     overflow:hidden, clip never creates a scroll container, so the
     sticky first column holds at every instant — including mid-reveal.
     The product pins this column (twenty-front's record table); the old
     mockup ships it broken (user-ratified improvement). */
  overflow-x: visible;
  overflow-y: clip;

  @keyframes tableRowAppear {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: ${APP_PREVIEW_CHROME.recordTableRowHeightPx}px;
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
      return THEME_LIGHT.background.primary;
    }
    return $hovered
      ? THEME_LIGHT.background.secondary
      : THEME_LIGHT.background.primary;
  }};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  border-right: 1px solid ${THEME_LIGHT.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: ${APP_PREVIEW_CHROME.recordTableRowHeightPx}px;
  justify-content: ${({ $align }) =>
    $align === 'right' ? 'flex-end' : 'flex-start'};
  left: ${({ $sticky }) => ($sticky ? '0' : 'auto')};
  min-width: ${({ $width }) => `${$width}px`};
  padding-bottom: 0;
  padding-right: ${CELL_HORIZONTAL_PADDING}px;
  padding-top: 0;
  padding-left: ${({ $sticky }) =>
    $sticky
      ? `${CELL_HORIZONTAL_PADDING - 1}px`
      : `${CELL_HORIZONTAL_PADDING}px`};
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
      return THEME_LIGHT.background.primary;
    }
    return $hovered
      ? THEME_LIGHT.background.secondary
      : THEME_LIGHT.background.primary;
  }};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
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
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MutedText = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
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

const EdgePlus = styled.div`
  margin-left: auto;
`;

const SKELETON_ROW_INDEXES = [0, 1, 2, 3, 4, 5, 6];

const SkeletonRowLead = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  width: 100%;
`;

export function TablePage({ page }: { page: TablePageDefinition }) {
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
    (total, column) => total + column.width,
    0,
  );
  const totalTableWidth = page.width ?? columnWidth;
  const fillerWidth = Math.max(totalTableWidth - columnWidth, 0);

  return (
    <TableShell>
      <TableViewport
        $dragging={dragging}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={viewportRef}
      >
        <TableCanvas $width={totalTableWidth}>
          <HeaderRow>
            {page.columns.map((column) => (
              <TableCell
                $align={column.align}
                $header
                $sticky={column.isFirstColumn}
                $width={column.width}
                key={column.id}
              >
                <HeaderCellContent>
                  {column.isFirstColumn ? (
                    <>
                      <TableCheckbox />
                      {renderTableHeaderIcon(column.id)}
                      <HeaderLabel>{column.label}</HeaderLabel>
                      <EdgePlus aria-hidden>
                        <MiniIcon
                          icon={IconPlus}
                          color={THEME_LIGHT.font.color.tertiary}
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
                    color={THEME_LIGHT.font.color.tertiary}
                    size={16}
                  />
                </HeaderFillContent>
              ) : null}
            </EmptyFillCell>
          </HeaderRow>
          {page.generating
            ? SKELETON_ROW_INDEXES.map((rowIndex) => (
                <DataRow $rowIndex={rowIndex} key={`skeleton-${rowIndex}`}>
                  {page.columns.map((column) => (
                    <TableCell
                      $align={column.align}
                      $sticky={column.isFirstColumn}
                      $width={column.width}
                      key={column.id}
                    >
                      {column.isFirstColumn ? (
                        <SkeletonRowLead>
                          <PREVIEW_SKELETON.Circle $size={16} />
                          <PREVIEW_SKELETON.Bar $height={8} $width="58%" />
                        </SkeletonRowLead>
                      ) : (
                        <PREVIEW_SKELETON.Bar $height={8} $width="56%" />
                      )}
                    </TableCell>
                  ))}
                  <EmptyFillCell $width={fillerWidth} />
                </DataRow>
              ))
            : page.rows.map((row, rowIndex) => {
                const hovered = hoveredRowId === row.id;
                return (
                  <DataRow
                    $rowIndex={rowIndex}
                    data-row-id={row.id}
                    key={row.id}
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
                          $align={column.align}
                          $hovered={hovered}
                          $sticky={column.isFirstColumn}
                          $width={column.width}
                          key={`${row.id}-${column.id}`}
                        >
                          {cell
                            ? renderTableCellValue({
                                cell,
                                columnId: column.id,
                                hovered,
                                isFirstColumn: !!column.isFirstColumn,
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
                    color={THEME_LIGHT.font.color.tertiary}
                  />
                </FooterFirstContent>
              </TableCell>
            ) : null}
            {page.columns.slice(1).map((column) => (
              <TableCell
                $align={column.align}
                $width={column.width}
                key={`footer-${column.id}`}
              />
            ))}
            <EmptyFillCell $footer $width={fillerWidth} />
          </FooterRow>
        </TableCanvas>
      </TableViewport>
    </TableShell>
  );
}
