'use client';

import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconChevronDown,
  IconLink,
  IconPlus,
} from '@tabler/icons-react';
import { useState } from 'react';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { Chip } from '@/app-preview/primitives/chip';
import { useHorizontalDragScroll } from '@/app-preview/stage/use-horizontal-drag-scroll';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';
import { LIVE_DATA_SCENE } from '@/tokens/feature-scenes/live-data-scene';

// The mini companies table renders the app-preview vocabulary (the same
// Chip and generated theme the mockup uses); the live-data tints are the
// scene's own.
const theme = APP_PREVIEW_THEME;
const SCENE = LIVE_DATA_SCENE;
const APP_FONT = theme.font.family;
const TABLE_CELL_HORIZONTAL_PADDING = 8;
const TABLER_STROKE = 1.6;
const DEFAULT_TABLE_WIDTH = 520;
const ROW_ENTER_DURATION_MS = 760;
const ROW_ENTER_STAGGER_MS = 160;

const TABLE_COLUMNS = [
  { id: 'company', isFirstColumn: true, label: 'Companies', width: 180 },
  { id: 'type', isFirstColumn: false, label: 'Type', width: 132 },
  { id: 'url', isFirstColumn: false, label: 'Domain', width: 150 },
];

type TableRow = {
  company: string;
  domain: string;
  isNew?: boolean;
  logoSrc?: string;
  status: string;
};

const BASE_TABLE_ROWS: ReadonlyArray<TableRow> = [
  {
    company: 'Anthropic',
    domain: 'anthropic.com',
    logoSrc: sharedAssetUrls.companyLogoForDomain('anthropic.com'),
    status: 'Customer',
  },
  {
    company: 'Slack',
    domain: 'slack.com',
    logoSrc: sharedAssetUrls.companyLogoForDomain('slack.com'),
    status: 'Customer',
  },
  {
    company: 'Notion',
    domain: 'notion.so',
    logoSrc: sharedAssetUrls.companyLogoForDomain('notion.com'),
    status: 'Customer',
  },
  {
    company: 'Sequoia',
    domain: 'sequoiacap.com',
    logoSrc: sharedAssetUrls.companyLogoForDomain('sequoiacap.com'),
    status: 'Customer',
  },
  {
    company: 'Cursor',
    domain: 'cursor.com',
    logoSrc: sharedAssetUrls.companyLogoForDomain('cursor.com'),
    status: 'Customer',
  },
];

const EXPANDED_TABLE_ROWS: ReadonlyArray<TableRow> = [
  ...BASE_TABLE_ROWS,
  {
    company: 'Twenty',
    domain: 'twenty.com',
    isNew: true,
    logoSrc: sharedAssetUrls.companyLogoForDomain('twenty.com'),
    status: 'Customer',
  },
  {
    company: 'Linear',
    domain: 'linear.app',
    isNew: true,
    logoSrc: sharedAssetUrls.companyLogoForDomain('linear.app'),
    status: 'Customer',
  },
];

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
  min-height: 100%;
  min-width: ${({ $width }) => `${$width}px`};
  width: ${({ $width }) => `${$width}px`};
`;

const HeaderRow = styled.div`
  display: flex;
`;

const DataRow = styled.div`
  display: flex;
`;

const RowMotion = styled.div<{ $delayMs?: number; $entering?: boolean }>`
  align-items: center;
  animation: ${({ $entering }) =>
    $entering
      ? `live-data-row-enter ${ROW_ENTER_DURATION_MS}ms ${SCENE.rowEnterEase}`
      : 'none'};
  animation-delay: ${({ $delayMs = 0 }) => `${$delayMs}ms`};
  animation-fill-mode: both;
  display: flex;
  height: 100%;
  min-width: 0;
  width: 100%;
  will-change: opacity, transform;

  @keyframes live-data-row-enter {
    0% {
      opacity: 0;
      transform: translate3d(0, 28px, 0);
    }

    58% {
      opacity: 1;
      transform: translate3d(0, 6px, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Rows still appear (functional — the demo is showing live data
       arriving) but with no slide / fade easing. */
    animation-duration: 1ms;
    animation-delay: 0ms;
    animation-timing-function: linear;
  }
`;

const FooterRow = styled.div`
  display: flex;
`;

const TableCell = styled.div<{
  $header?: boolean;
  $hovered?: boolean;
  $sticky?: boolean;
  $width: number;
}>`
  align-items: center;
  background: ${({ $header, $hovered }) => {
    if ($header) {
      return theme.background.primary;
    }

    return $hovered ? theme.background.secondary : theme.background.primary;
  }};
  border-bottom: 1px solid ${theme.border.color.light};
  border-right: 1px solid ${theme.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: 32px;
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
      return theme.background.primary;
    }

    return $hovered ? theme.background.secondary : theme.background.primary;
  }};
  border-bottom: 1px solid ${theme.border.color.light};
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
  color: ${theme.font.color.tertiary};
  font-family: ${APP_FONT};
  font-size: ${theme.font.sizePx.md}px;
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

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.border.color.strong};
  border-radius: 3px;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const CellHoverAnchor = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const LinkCellAnchor = styled.div`
  min-width: 0;
  position: relative;
  width: 100%;
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

const MutedText = styled.span`
  color: ${theme.font.color.tertiary};
  font-family: ${APP_FONT};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  white-space: nowrap;
`;

const LogoBase = styled.div`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;
`;

const CompanyLogoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 14px;
`;

const StatusChip = styled.div<{ $edited?: boolean; $hoveredByAlice?: boolean }>`
  align-items: center;
  background: ${({ $edited }) =>
    $edited ? SCENE.colors.tagPurpleSurface : SCENE.colors.tagGreenSurface};
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px
    ${({ $edited }) =>
      $edited ? SCENE.colors.tagPurpleSurface : SCENE.colors.tagGreenSurface};
  color: ${({ $edited }) =>
    $edited ? SCENE.colors.tagPurple : SCENE.colors.tagGreen};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: ${theme.font.sizePx.md}px;
  font-weight: ${theme.font.weight.regular};
  height: 20px;
  justify-content: center;
  line-height: 1.4;
  padding: 3px ${theme.spacingBasePx}px;
  transform: ${({ $hoveredByAlice }) =>
    $hoveredByAlice ? 'scale(1.1)' : 'scale(1)'};
  transform-origin: center;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    color 180ms ease,
    transform 180ms ease,
    width 180ms ease;
  white-space: nowrap;
`;

function HeaderIcon({ columnId }: { columnId: string }) {
  if (columnId === 'url') {
    return (
      <IconLink
        aria-hidden
        color={theme.font.color.tertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  if (columnId === 'type') {
    return (
      <IconCheckbox
        aria-hidden
        color={theme.font.color.tertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  return (
    <IconBuildingSkyscraper
      aria-hidden
      color={theme.font.color.tertiary}
      size={16}
      stroke={TABLER_STROKE}
    />
  );
}

function PlusMini({ size = 12 }: { size?: number }) {
  return (
    <IconPlus
      aria-hidden
      color={theme.font.color.tertiary}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function CompanyCell({ label, logoSrc }: { label: string; logoSrc?: string }) {
  return (
    <CellHoverAnchor>
      <CheckboxContainer>
        <CheckboxBox />
      </CheckboxContainer>
      <Chip
        clickable={false}
        label={label}
        leftComponent={
          <LogoBase>
            <CompanyLogoImage
              alt=""
              decoding="async"
              loading="lazy"
              src={logoSrc}
            />
          </LogoBase>
        }
        variant="highlighted"
      />
    </CellHoverAnchor>
  );
}

function LinkCell({ label }: { label: string }) {
  return (
    <LinkCellAnchor>
      <Chip clickable={false} label={label} variant="static" />
    </LinkCellAnchor>
  );
}

export function LiveDataTable({
  editedStatusLabel,
  isFirstTagEdited,
  isFirstTagHoveredByAlice,
  showExtendedRows,
}: {
  editedStatusLabel: string;
  isFirstTagEdited: boolean;
  isFirstTagHoveredByAlice: boolean;
  showExtendedRows: boolean;
}) {
  const {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  } = useHorizontalDragScroll<HTMLDivElement>({
    wheelScrollsHorizontally: true,
  });
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const visibleRows = showExtendedRows ? EXPANDED_TABLE_ROWS : BASE_TABLE_ROWS;

  const columnWidth = TABLE_COLUMNS.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  const totalTableWidth = Math.max(DEFAULT_TABLE_WIDTH, columnWidth);
  const fillerWidth = Math.max(totalTableWidth - columnWidth, 0);

  return (
    <TableShell>
      <TableViewport
        ref={viewportRef}
        $dragging={dragging}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <TableCanvas $width={totalTableWidth}>
          <HeaderRow>
            {TABLE_COLUMNS.map((column) => (
              <TableCell
                key={column.id}
                $header
                $sticky={column.isFirstColumn}
                $width={column.width}
              >
                <HeaderCellContent>
                  {column.isFirstColumn ? (
                    <>
                      <CheckboxContainer>
                        <CheckboxBox />
                      </CheckboxContainer>
                      <HeaderIcon columnId={column.id} />
                      <HeaderLabel>{column.label}</HeaderLabel>
                      <EdgePlus aria-hidden="true">
                        <PlusMini />
                      </EdgePlus>
                    </>
                  ) : (
                    <>
                      <HeaderIcon columnId={column.id} />
                      <HeaderLabel>{column.label}</HeaderLabel>
                    </>
                  )}
                </HeaderCellContent>
              </TableCell>
            ))}
            <EmptyFillCell $header $width={fillerWidth}>
              {fillerWidth > 0 ? (
                <HeaderFillContent>
                  <PlusMini size={16} />
                </HeaderFillContent>
              ) : null}
            </EmptyFillCell>
          </HeaderRow>

          {visibleRows.map((row, index) => {
            const hovered = hoveredRowIndex === index;
            const enterDelayMs = row.isNew
              ? ROW_ENTER_STAGGER_MS * (index - BASE_TABLE_ROWS.length + 1)
              : 0;

            return (
              <DataRow
                key={row.company}
                onMouseEnter={() => setHoveredRowIndex(index)}
                onMouseLeave={() =>
                  setHoveredRowIndex((current) =>
                    current === index ? null : current,
                  )
                }
              >
                <TableCell
                  $hovered={hovered}
                  $sticky
                  $width={TABLE_COLUMNS[0].width}
                >
                  <RowMotion $delayMs={enterDelayMs} $entering={row.isNew}>
                    <CompanyCell label={row.company} logoSrc={row.logoSrc} />
                  </RowMotion>
                </TableCell>
                <TableCell $hovered={hovered} $width={TABLE_COLUMNS[1].width}>
                  <RowMotion $delayMs={enterDelayMs} $entering={row.isNew}>
                    <StatusChip
                      $edited={index === 0 && isFirstTagEdited}
                      $hoveredByAlice={index === 0 && isFirstTagHoveredByAlice}
                    >
                      {index === 0 && isFirstTagEdited
                        ? editedStatusLabel
                        : row.status}
                    </StatusChip>
                  </RowMotion>
                </TableCell>
                <TableCell $hovered={hovered} $width={TABLE_COLUMNS[2].width}>
                  <RowMotion $delayMs={enterDelayMs} $entering={row.isNew}>
                    <LinkCell label={row.domain} />
                  </RowMotion>
                </TableCell>
                <EmptyFillCell $hovered={hovered} $width={fillerWidth}>
                  <RowMotion $delayMs={enterDelayMs} $entering={row.isNew} />
                </EmptyFillCell>
              </DataRow>
            );
          })}

          <FooterRow>
            <TableCell $sticky $width={TABLE_COLUMNS[0].width}>
              <FooterFirstContent>
                <MutedText>Calculate</MutedText>
                <IconChevronDown
                  aria-hidden
                  color={theme.font.color.tertiary}
                  size={14}
                  stroke={TABLER_STROKE}
                />
              </FooterFirstContent>
            </TableCell>
            <TableCell $width={TABLE_COLUMNS[1].width} />
            <TableCell $width={TABLE_COLUMNS[2].width} />
            <EmptyFillCell $footer $width={fillerWidth} />
          </FooterRow>
        </TableCanvas>
      </TableViewport>
    </TableShell>
  );
}
