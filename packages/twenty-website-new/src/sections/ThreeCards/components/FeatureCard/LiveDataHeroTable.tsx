'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconAt,
  IconCheckbox,
  IconChevronDown,
  IconPlus,
  IconUser,
} from '@tabler/icons-react';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Chip,
  ChipVariant,
} from '@/sections/Hero/components/HomeVisual/homeVisualChip';
import { VISUAL_TOKENS } from '@/sections/Hero/components/HomeVisual/homeVisualTokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const TABLE_CELL_HORIZONTAL_PADDING = 8;
const TABLER_STROKE = 1.6;
const DEFAULT_TABLE_WIDTH = 520;
const ROW_ENTER_DURATION_MS = 760;
const ROW_ENTER_STAGGER_MS = 160;

const COLORS = {
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  avatarBackground: '#1f1f1f',
  avatarText: '#ffffff',
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
  { id: 'contact', isFirstColumn: true, label: 'Contacts', width: 180 },
  { id: 'segment', isFirstColumn: false, label: 'Segment', width: 132 },
  { id: 'email', isFirstColumn: false, label: 'Email', width: 190 },
] as const;

type TableRow = {
  contact: string;
  email: string;
  initials: string;
  isNew?: boolean;
  segment: string;
};

const BASE_TABLE_ROWS: ReadonlyArray<TableRow> = [
  {
    contact: 'Ava Martinez',
    email: 'ava@resend.com',
    initials: 'AM',
    segment: 'VIP',
  },
  {
    contact: 'Noah Kim',
    email: 'noah@resend.com',
    initials: 'NK',
    segment: 'Champion',
  },
  {
    contact: 'Lena Patel',
    email: 'lena@resend.com',
    initials: 'LP',
    segment: 'Champion',
  },
  {
    contact: 'Miles Chen',
    email: 'miles@resend.com',
    initials: 'MC',
    segment: 'Warm',
  },
  {
    contact: 'Zoe Rivera',
    email: 'zoe@resend.com',
    initials: 'ZR',
    segment: 'Warm',
  },
];

const EXPANDED_TABLE_ROWS: ReadonlyArray<TableRow> = [
  ...BASE_TABLE_ROWS,
  {
    contact: 'Eli Brooks',
    email: 'eli@resend.com',
    initials: 'EB',
    isNew: true,
    segment: 'Prospect',
  },
  {
    contact: 'Ivy Foster',
    email: 'ivy@resend.com',
    initials: 'IF',
    isNew: true,
    segment: 'New',
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
      ? `live-data-row-enter ${ROW_ENTER_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
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
  height: 16px;
  justify-content: center;
  overflow: hidden;
  width: 16px;
`;

const ContactAvatar = styled.div`
  align-items: center;
  background: ${COLORS.avatarBackground};
  border-radius: 999px;
  color: ${COLORS.avatarText};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 8px;
  font-weight: ${theme.font.weight.medium};
  height: 16px;
  justify-content: center;
  letter-spacing: 0.02em;
  line-height: 1;
  text-transform: uppercase;
  width: 16px;
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

function HeaderIcon({
  columnId,
}: {
  columnId: (typeof TABLE_COLUMNS)[number]['id'];
}) {
  if (columnId === 'email') {
    return (
      <IconAt
        aria-hidden
        color={COLORS.textTertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  if (columnId === 'segment') {
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
    <IconUser
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

function ContactCell({ initials, label }: { initials: string; label: string }) {
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
            <ContactAvatar aria-hidden>{initials}</ContactAvatar>
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
  showExtendedRows: boolean;
};

export function LiveDataHeroTable({
  editedStatusLabel,
  isFirstTagEdited,
  isFirstTagHoveredByAlice,
  showExtendedRows,
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
  const visibleRows = showExtendedRows ? EXPANDED_TABLE_ROWS : BASE_TABLE_ROWS;

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
      <TableViewport
        ref={viewportRef}
        $dragging={dragging}
        aria-label="Interactive preview of the Resend contacts table"
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

          {visibleRows.map((row, index) => {
            const hovered = hoveredRowIndex === index;
            const enterDelayMs = row.isNew
              ? ROW_ENTER_STAGGER_MS * (index - BASE_TABLE_ROWS.length + 1)
              : 0;

            return (
              <DataRow
                key={row.contact}
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
                    <ContactCell initials={row.initials} label={row.contact} />
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
                        : row.segment}
                    </StatusChip>
                  </RowMotion>
                </TableCell>
                <TableCell $hovered={hovered} $width={TABLE_COLUMNS[2].width}>
                  <RowMotion $delayMs={enterDelayMs} $entering={row.isNew}>
                    <LinkCell label={row.email} />
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
