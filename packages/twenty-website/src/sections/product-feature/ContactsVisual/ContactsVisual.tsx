'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';
import { useHorizontalDragScroll } from '@/platform/motion';
import { EASING } from '@/tokens';

import { CellValue } from './components/CellValue';
import { COLUMNS } from './data/columns';
import { COMPANIES } from './data/companies';
import { HEADER_ICONS } from './data/header-icons';

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: var(--font-product), sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const ViewHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 0 12px;
`;

const ViewTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
`;

const ViewCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const TableShell = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const GripRail = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: grid;
  flex: 0 0 12px;
  grid-auto-rows: 32px;
  width: 12px;
`;

const GripCell = styled.div`
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
`;

const TableViewport = styled.div`
  cursor: grab;
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

  &[data-dragging] {
    cursor: grabbing;
  }
`;

const TableCanvas = styled.div<{ $width: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
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

const Cell = styled.div<{ $width: number }>`
  align-items: center;
  background-color: ${THEME_LIGHT.background.primary};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  border-right: 1px solid ${THEME_LIGHT.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: 32px;
  min-width: ${({ $width }) => `${$width}px`};
  overflow: hidden;
  padding: 0 8px;
`;

const DataRow = styled.div<{ $index: number }>`
  animation: rowIn 420ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  display: flex;

  &:hover > div {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }

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

const HeaderContent = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

const HeaderLabel = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderIcon = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: inline-flex;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
`;

const EdgePlus = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  display: inline-flex;
  margin-left: auto;
`;

const CheckboxWrap = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.strong};
  border-radius: 3px;
  display: flex;
  height: 14px;
  justify-content: center;
  transition:
    background-color 0.1s,
    border-color 0.1s;
  width: 14px;

  &:hover,
  &[data-checked] {
    border-color: ${THEME_LIGHT.border.color.blue};
  }

  &[data-checked] {
    background-color: ${THEME_LIGHT.background.transparent.blue};
  }
`;

const GRIP_CELL_COUNT = 11;

const TOTAL_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0);

const GRIP_CELLS = Array.from(
  { length: GRIP_CELL_COUNT },
  (_, gripNumber) => gripNumber,
);

export function ContactsVisual({ active: _active }: { active: boolean }) {
  const { i18n } = useLingui();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  } = useHorizontalDragScroll<HTMLDivElement>();

  const toggleCheck = (domain: string) => {
    setChecked((previous) => ({ ...previous, [domain]: !previous[domain] }));
  };

  const rows = COMPANIES.map((company, rowNumber) => ({ company, rowNumber }));

  return (
    <Root>
      <ViewHeader>
        <ViewTitle>All Companies</ViewTitle>
        <ViewCount>· 9</ViewCount>
      </ViewHeader>

      <TableShell>
        <GripRail>
          {GRIP_CELLS.map((gripNumber) => (
            <GripCell key={gripNumber} />
          ))}
        </GripRail>

        <TableViewport
          data-dragging={dragging ? '' : undefined}
          onPointerCancel={onPointerCancel}
          onPointerDown={onPointerDown}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          ref={viewportRef}
        >
          <TableCanvas $width={TOTAL_WIDTH}>
            <HeaderRow>
              {COLUMNS.map((column) => {
                const HeaderColumnIcon = HEADER_ICONS[column.id];

                return (
                  <Cell $width={column.width} key={column.id}>
                    <HeaderContent>
                      {column.isFirstColumn ? (
                        <CheckboxWrap aria-hidden>
                          <CheckboxBox />
                        </CheckboxWrap>
                      ) : null}
                      <HeaderIcon>
                        <HeaderColumnIcon size={16} stroke={1.6} />
                      </HeaderIcon>
                      <HeaderLabel>{column.label}</HeaderLabel>
                      {column.isFirstColumn ? (
                        <EdgePlus>
                          <IconPlus size={12} stroke={1.6} />
                        </EdgePlus>
                      ) : null}
                    </HeaderContent>
                  </Cell>
                );
              })}
            </HeaderRow>

            {rows.map(({ company, rowNumber }) => {
              const isChecked = Boolean(checked[company.domain]);

              return (
                <DataRow $index={rowNumber} key={company.domain}>
                  {COLUMNS.map((column) => (
                    <Cell $width={column.width} key={column.id}>
                      {column.isFirstColumn ? (
                        <HeaderContent>
                          <CheckboxWrap
                            aria-checked={isChecked}
                            aria-label={i18n._(msg`Select ${company.name}`)}
                            onClick={() => toggleCheck(company.domain)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                toggleCheck(company.domain);
                              }
                            }}
                            onPointerDown={(event) => event.stopPropagation()}
                            role="checkbox"
                            tabIndex={0}
                          >
                            <CheckboxBox
                              data-checked={isChecked ? '' : undefined}
                            >
                              {isChecked ? (
                                <IconCheck
                                  color={THEME_LIGHT.border.color.blue}
                                  size={9}
                                  stroke={2}
                                />
                              ) : null}
                            </CheckboxBox>
                          </CheckboxWrap>
                          <CellValue columnId={column.id} company={company} />
                        </HeaderContent>
                      ) : (
                        <CellValue columnId={column.id} company={company} />
                      )}
                    </Cell>
                  ))}
                </DataRow>
              );
            })}
          </TableCanvas>
        </TableViewport>
      </TableShell>
    </Root>
  );
}
