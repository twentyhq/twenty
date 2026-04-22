'use client';

import { getSharedCompanyLogoUrlFromDomainName } from '@/lib/shared-asset-paths';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBrandLinkedin,
  IconBuildingFactory2,
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconCreativeCommonsSa,
  IconLink,
  IconMap2,
  IconMoneybag,
  IconPencil,
  IconPlus,
  IconTarget,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type {
  HeroCellEntity,
  HeroCellPerson,
  HeroCellRelation,
  HeroCellText,
  HeroCellValue,
  HeroTablePageDefinition,
} from '../../types/HeroHomeData';
import { Chip, ChipVariant } from './homeVisualChip';
import { VISUAL_TOKENS } from './homeVisualTokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const TABLE_CELL_HORIZONTAL_PADDING = 8;
const HOVER_ACTION_EDGE_INSET = 4;
const TABLER_STROKE = 1.6;

const COLORS = {
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurface: VISUAL_TOKENS.accent.primary,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  background: VISUAL_TOKENS.background.primary,
  backgroundSecondary: VISUAL_TOKENS.background.secondary,
  border: VISUAL_TOKENS.border.color.medium,
  borderLight: VISUAL_TOKENS.border.color.light,
  borderStrong: VISUAL_TOKENS.border.color.strong,
  text: VISUAL_TOKENS.font.color.primary,
  textSecondary: VISUAL_TOKENS.font.color.secondary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
};

const PERSON_TONES: Record<string, { background: string; color: string }> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  orange: { background: '#ffdcc3', color: '#ED5F00' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

const ROW_HOVER_ACTION_DISABLED_COLUMNS = new Set([
  'createdBy',
  'accountOwner',
]);

const HEADER_ICON_MAP: Record<string, typeof IconCalendarEvent> = {
  added: IconCalendarEvent,
  accountOwner: IconUserCircle,
  address: IconMap2,
  arr: IconMoneybag,
  createdBy: IconCreativeCommonsSa,
  employees: IconUsers,
  icp: IconTarget,
  industry: IconBuildingFactory2,
  linkedin: IconBrandLinkedin,
  mainContact: IconUser,
  opportunities: IconTargetArrow,
  url: IconLink,
};

const failedAvatarUrls = new Set<string>();
const failedFaviconUrls = new Set<string>();

type MiniIconProps = {
  color?: string;
  size?: number;
};

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
  animation: heroTableHeaderAppear 260ms ease-out both;
  display: flex;

  @keyframes heroTableHeaderAppear {
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
  animation: heroTableRowAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $rowIndex }) => `${120 + $rowIndex * 70}ms`};
  display: flex;

  @keyframes heroTableRowAppear {
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

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) =>
    $checked ? COLORS.accentSurfaceSoft : 'transparent'};
  border: 1px solid
    ${({ $checked }) => ($checked ? COLORS.accentBorder : COLORS.borderStrong)};
  border-radius: 3px;
  display: flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

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
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MutedText = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  white-space: nowrap;
`;

const RightAlignedText = styled(InlineText)`
  text-align: right;
  width: 100%;
`;

const PersonAvatarCircle = styled.div<{
  $background: string;
  $color: string;
  $square?: boolean;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${({ $square }) => ($square ? '4px' : '999px')};
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;
`;

const AvatarImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
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
  right: ${({ $rightInset = HOVER_ACTION_EDGE_INSET - TABLE_CELL_HORIZONTAL_PADDING }) =>
    `${$rightInset}px`};
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
  color: ${COLORS.textSecondary};
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
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

const TagChip = styled.div`
  align-items: center;
  background: ${VISUAL_TOKENS.background.transparent.light};
  border-radius: 4px;
  color: ${COLORS.textSecondary};
  display: inline-flex;
  font-family: ${APP_FONT};
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

const FaviconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function sanitizeURL(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

function getLogoUrlFromDomainName(domainName?: string): string | undefined {
  const sharedLogoUrl = getSharedCompanyLogoUrlFromDomainName(domainName);

  if (sharedLogoUrl) {
    return sharedLogoUrl;
  }

  const sanitizedDomain = sanitizeURL(domainName);

  return sanitizedDomain
    ? `https://twenty-icons.com/${sanitizedDomain}`
    : undefined;
}

function PlusMini({ color = COLORS.textSecondary, size = 14 }: MiniIconProps) {
  return (
    <IconPlus aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CheckMini({ color = COLORS.text, size = 12 }: MiniIconProps) {
  return (
    <IconCheck aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CloseMini({ color = COLORS.text, size = 12 }: MiniIconProps) {
  return <IconX aria-hidden color={color} size={size} stroke={TABLER_STROKE} />;
}

function PencilMini({
  color = COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconPencil aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function CopyMini({
  color = COLORS.textSecondary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconCopy aria-hidden color={color} size={size} stroke={TABLER_STROKE} />
  );
}

function ChevronDownMini({
  color = COLORS.textTertiary,
  size = 14,
}: MiniIconProps) {
  return (
    <IconChevronDown
      aria-hidden
      color={color}
      size={size}
      stroke={TABLER_STROKE}
    />
  );
}

function FaviconLogo({
  src,
  domain,
  label,
  size = 14,
}: {
  domain?: string;
  label?: string;
  size?: number;
  src?: string;
}) {
  const faviconUrl = src ?? getLogoUrlFromDomainName(domain);
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showFavicon =
    faviconUrl !== undefined &&
    !failedFaviconUrls.has(faviconUrl) &&
    localFailedUrl !== faviconUrl;

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    overflow: 'hidden',
    fontFamily: APP_FONT,
    fontSize: size <= 14 ? '8px' : '9px',
    fontWeight: 600,
    lineHeight: 1,
  } as const;

  if (showFavicon) {
    return (
      <div style={baseStyle}>
        <FaviconImage
          alt={label ? `${label} logo` : ''}
          src={faviconUrl}
          onError={() => {
            failedFaviconUrls.add(faviconUrl);
            setLocalFailedUrl(faviconUrl);
          }}
        />
      </div>
    );
  }

  const initials = label ? getInitials(label) : '?';

  return (
    <div style={{ ...baseStyle, background: '#ebebeb', color: '#666666' }}>
      {initials.slice(0, 1)}
    </div>
  );
}

function PersonAvatarContent({ token }: { token: HeroCellPerson }) {
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showAvatar =
    token.avatarUrl !== undefined &&
    !failedAvatarUrls.has(token.avatarUrl) &&
    localFailedUrl !== token.avatarUrl;

  if (showAvatar) {
    return (
      <AvatarImage
        alt=""
        src={token.avatarUrl}
        onError={() => {
          if (token.avatarUrl) {
            failedAvatarUrls.add(token.avatarUrl);
            setLocalFailedUrl(token.avatarUrl);
          }
        }}
      />
    );
  }

  return token.shortLabel ?? getInitials(token.name);
}

function PersonTokenCell({
  token,
  hovered = false,
  withCopyAction = true,
}: {
  hovered?: boolean;
  token: HeroCellPerson;
  withCopyAction?: boolean;
}) {
  const tone = PERSON_TONES[token.tone ?? 'gray'] ?? PERSON_TONES.gray;
  const square =
    token.kind === 'api' ||
    token.kind === 'system' ||
    token.kind === 'workflow';

  return (
    <CellHoverAnchor>
      <CellChip
        clickable={false}
        label={token.name}
        leftComponent={
          <PersonAvatarCircle
            $background={tone.background}
            $color={tone.color}
            $square={square}
          >
            <PersonAvatarContent token={token} />
          </PersonAvatarCircle>
        }
      />
      <HoverActions $visible={hovered}>
        {withCopyAction ? (
          <MiniAction aria-hidden="true">
            <CopyMini />
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
  cell: HeroCellEntity;
  hovered: boolean;
  isFirstColumn: boolean;
}) {
  if (isFirstColumn) {
    return (
      <EntityCellLayout>
        <CheckboxContainer>
          <CheckboxBox />
        </CheckboxContainer>
        <CellChip
          clickable={false}
          label={cell.name}
          leftComponent={<FaviconLogo domain={cell.domain} label={cell.name} />}
          variant={ChipVariant.Highlighted}
        />
        <HoverActions $visible={hovered}>
          <MiniAction aria-hidden="true">
            <PencilMini />
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
  cell: HeroCellRelation;
  hovered: boolean;
}) {
  return (
    <CellHoverAnchor>
      <MultiChipStack>
        {cell.items.map((item) => {
          const tone = PERSON_TONES[item.tone ?? 'gray'] ?? PERSON_TONES.gray;

          return (
            <CellChip
              key={item.name}
              clickable={false}
              label={item.name}
              leftComponent={
                <PersonAvatarCircle
                  $background={tone.background}
                  $color={tone.color}
                >
                  {item.shortLabel ?? getInitials(item.name)}
                </PersonAvatarCircle>
              }
            />
          );
        })}
      </MultiChipStack>
      <HoverActions $visible={hovered}>
        <MiniAction aria-hidden="true">
          <CopyMini />
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
  cell: HeroCellText;
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

  const tone = PERSON_TONES[cell.tone ?? 'gray'] ?? PERSON_TONES.gray;

  return (
    <CellChip
      clickable={handleNavigate !== undefined}
      label={cell.value}
      leftComponent={
        <PersonAvatarCircle $background={tone.background} $color={tone.color}>
          {cell.shortLabel}
        </PersonAvatarCircle>
      }
      onClick={handleNavigate}
    />
  );
}

function renderCellValue(
  cell: HeroCellValue,
  hovered: boolean,
  isFirstColumn: boolean,
  columnId: string,
  onNavigateToLabel?: (label: string) => void,
): ReactNode {
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
          {cell.value ? <CheckMini size={11} /> : <CloseMini size={11} />}
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

function renderHeaderIcon(columnId: string): ReactNode {
  const Icon = HEADER_ICON_MAP[columnId];

  if (Icon) {
    return (
      <Icon
        aria-hidden
        color={COLORS.textTertiary}
        size={16}
        stroke={TABLER_STROKE}
      />
    );
  }

  return (
    <IconCalendarEvent
      aria-hidden
      color={COLORS.textTertiary}
      size={16}
      stroke={TABLER_STROKE}
    />
  );
}

export function TablePage({
  page,
  onNavigateToLabel,
}: {
  page: HeroTablePageDefinition;
  onNavigateToLabel?: (label: string) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startScrollLeft: 0,
    startX: 0,
  });
  const [dragging, setDragging] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const columnWidth = page.columns.reduce((sum, column) => sum + column.width, 0);
  const totalTableWidth = page.width ?? columnWidth;
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
        onPointerCancel={endDragging}
        onPointerDown={handlePointerDown}
        onPointerLeave={endDragging}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
                      <CheckboxContainer>
                        <CheckboxBox />
                      </CheckboxContainer>
                      {renderHeaderIcon(column.id)}
                      <HeaderLabel>{column.label}</HeaderLabel>
                      <EdgePlus aria-hidden="true">
                        <PlusMini color={COLORS.textTertiary} size={12} />
                      </EdgePlus>
                    </>
                  ) : (
                    <>
                      {renderHeaderIcon(column.id)}
                      <HeaderLabel>{column.label}</HeaderLabel>
                    </>
                  )}
                </HeaderCellContent>
              </TableCell>
            ))}
            <EmptyFillCell $header $width={fillerWidth}>
              {fillerWidth > 0 ? (
                <HeaderFillContent>
                  <PlusMini color={COLORS.textTertiary} size={16} />
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
                        ? renderCellValue(
                            cell,
                            hovered,
                            !!column.isFirstColumn,
                            column.id,
                            onNavigateToLabel,
                          )
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
                  <ChevronDownMini />
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
