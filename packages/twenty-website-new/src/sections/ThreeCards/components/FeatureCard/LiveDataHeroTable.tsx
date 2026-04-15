'use client';

import { SHARED_COMPANY_LOGO_URLS } from '@/lib/shared-asset-paths';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconChevronDown,
  IconLink,
  IconPlus,
} from '@tabler/icons-react';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Chip, ChipVariant } from '@/sections/Hero/components/HomeVisual/homeVisualChip';
import { VISUAL_TOKENS } from '@/sections/Hero/components/HomeVisual/homeVisualTokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const TABLE_CELL_HORIZONTAL_PADDING = 8;
const TABLER_STROKE = 1.6;
const DEFAULT_TABLE_WIDTH = 520;

const COLORS = {
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  background: VISUAL_TOKENS.background.primary,
  backgroundSecondary: VISUAL_TOKENS.background.secondary,
  borderLight: VISUAL_TOKENS.border.color.light,
  borderMedium: VISUAL_TOKENS.border.color.medium,
  borderStrong: VISUAL_TOKENS.border.color.strong,
  green: '#18794e',
  greenBorder: '#ddf3e4',
  greenSurface: '#ddf3e4',
  purple: '#793aaf',
  purpleBorder: '#f3e7fc',
  purpleSurface: '#f3e7fc',
  text: VISUAL_TOKENS.font.color.primary,
  textLight: VISUAL_TOKENS.font.color.light,
  textSecondary: VISUAL_TOKENS.font.color.secondary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
} as const;

const TABLE_COLUMNS = [
  { id: 'company', isFirstColumn: true, label: 'Companies', width: 180 },
  { id: 'type', isFirstColumn: false, label: 'Type', width: 160 },
  { id: 'url', isFirstColumn: false, label: 'Domain', width: 150 },
] as const;

const TABLE_ROWS = [
  {
    company: 'Slack',
    domain: 'slack.com',
    logoSrc: SHARED_COMPANY_LOGO_URLS.slack,
    status: 'Customer',
  },
  {
    company: 'Notion',
    domain: 'notion.so',
    logoSrc: SHARED_COMPANY_LOGO_URLS.notion,
    status: 'Customer',
  },
  {
    company: 'Sequoia',
    domain: 'sequoiacap.com',
    logoSrc: SHARED_COMPANY_LOGO_URLS.sequoia,
    status: 'Customer',
  },
] as const;

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
  border: 1px solid ${COLORS.borderStrong};
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

const CellChip = styled(Chip)`
  max-width: 100%;
  min-width: 0;
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
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
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
    $edited ? COLORS.purpleSurface : COLORS.greenSurface};
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px
    ${({ $edited }) => ($edited ? COLORS.purpleBorder : COLORS.greenBorder)};
  color: ${({ $edited }) => ($edited ? COLORS.purple : COLORS.green)};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: ${VISUAL_TOKENS.font.size.md};
  font-weight: ${VISUAL_TOKENS.font.weight.regular};
  height: 20px;
  justify-content: center;
  line-height: 1.4;
  padding: 3px ${VISUAL_TOKENS.spacing[1]};
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

function HeaderIcon({ columnId }: { columnId: (typeof TABLE_COLUMNS)[number]['id'] }) {
  if (columnId === 'url') {
    return (
      <IconLink
        aria-hidden
        color={COLORS.textTertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  if (columnId === 'type') {
    return (
      <IconCheckbox
        aria-hidden
        color={COLORS.textTertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  return (
    <IconBuildingSkyscraper
      aria-hidden
      color={COLORS.textTertiary}
      size={16}
      stroke={TABLER_STROKE}
    />
  );
}

function ChevronDownMini() {
  return (
    <IconChevronDown
      aria-hidden
      color={COLORS.textTertiary}
      size={14}
      stroke={TABLER_STROKE}
    />
  );
}

function PlusMini({ size = 12 }: { size?: number }) {
  return (
    <IconPlus
      aria-hidden
      color={COLORS.textTertiary}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function CompanyCell({
  label,
  logoSrc,
}: {
  label: string;
  logoSrc: string;
}) {
  return (
    <CellHoverAnchor>
      <CheckboxContainer>
        <CheckboxBox />
      </CheckboxContainer>
      <CellChip
        clickable={false}
        label={label}
        leftComponent={
          <LogoBase>
            <CompanyLogoImage alt="" decoding="async" loading="lazy" src={logoSrc} />
          </LogoBase>
        }
        variant={ChipVariant.Highlighted}
      />
    </CellHoverAnchor>
  );
}

function LinkCell({ label }: { label: string }) {
  return (
    <div style={{ minWidth: 0, position: 'relative', width: '100%' }}>
      <CellChip clickable={false} label={label} variant={ChipVariant.Static} />
    </div>
  );
}

type LiveDataHeroTableProps = {
  editedStatusLabel: string;
  isFirstTagEdited: boolean;
  isFirstTagHoveredByAlice: boolean;
};

export function LiveDataHeroTable({
  editedStatusLabel,
  isFirstTagEdited,
  isFirstTagHoveredByAlice,
}: LiveDataHeroTableProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startScrollLeft: 0,
    startX: 0,
  });
  const [dragging, setDragging] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const columnWidth = TABLE_COLUMNS.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  const totalTableWidth = Math.max(DEFAULT_TABLE_WIDTH, columnWidth);
  const fillerWidth = Math.max(totalTableWidth - columnWidth, 0);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      !viewportRef.current
    ) {
      return;
    }

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startScrollLeft: viewportRef.current.scrollLeft,
      startX: event.clientX,
    };

    viewportRef.current.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !viewportRef.current) {
      return;
    }

    viewportRef.current.scrollLeft =
      dragRef.current.startScrollLeft -
      (event.clientX - dragRef.current.startX);
  };

  const endDragging = () => {
    dragRef.current.active = false;
    dragRef.current.pointerId = -1;
    setDragging(false);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    viewportRef.current.releasePointerCapture(event.pointerId);
    endDragging();
  };

  useEffect(() => {
    const node = viewportRef.current;

    if (!node) {
      return;
    }

    const onWheel: EventListener = (event) => {
      if (!(event instanceof WheelEvent)) {
        return;
      }

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      const maxScrollLeft = Math.max(node.scrollWidth - node.clientWidth, 0);
      const nextScrollLeft = Math.min(
        Math.max(node.scrollLeft + event.deltaY, 0),
        maxScrollLeft,
      );

      if (Math.abs(nextScrollLeft - node.scrollLeft) < 0.5) {
        return;
      }

      node.scrollLeft = nextScrollLeft;
      event.preventDefault();
    };

    node.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      node.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <TableShell>
      <GripRail aria-hidden="true">
        <GripCell />
        {TABLE_ROWS.map((row) => (
          <GripCell key={`grip-${row.company}`} />
        ))}
        <GripCell />
      </GripRail>

      <TableViewport
        ref={viewportRef}
        $dragging={dragging}
        aria-label="Interactive preview of the companies table"
        onPointerCancel={endDragging}
        onPointerDown={handlePointerDown}
        onPointerLeave={endDragging}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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

          {TABLE_ROWS.map((row, index) => {
            const hovered = hoveredRowIndex === index;

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
                  <CompanyCell label={row.company} logoSrc={row.logoSrc} />
                </TableCell>
                <TableCell $hovered={hovered} $width={TABLE_COLUMNS[1].width}>
                  <StatusChip
                    $edited={index === 0 && isFirstTagEdited}
                    $hoveredByAlice={index === 0 && isFirstTagHoveredByAlice}
                  >
                    {index === 0 && isFirstTagEdited
                      ? editedStatusLabel
                      : row.status}
                  </StatusChip>
                </TableCell>
                <TableCell $hovered={hovered} $width={TABLE_COLUMNS[2].width}>
                  <LinkCell label={row.domain} />
                </TableCell>
                <EmptyFillCell $hovered={hovered} $width={fillerWidth} />
              </DataRow>
            );
          })}

          <FooterRow>
            <TableCell $sticky $width={TABLE_COLUMNS[0].width}>
              <FooterFirstContent>
                <MutedText>Calculate</MutedText>
                <ChevronDownMini />
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
