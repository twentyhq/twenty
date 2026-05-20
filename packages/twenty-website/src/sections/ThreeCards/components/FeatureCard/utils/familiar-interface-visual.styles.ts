import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { TOKEN_TONES } from './token-tones';

type TokenTone = keyof typeof TOKEN_TONES;

const APP_FONT = `'Inter', ${theme.font.family.sans}`;

export const SCENE_WIDTH = 411;
export const SCENE_HEIGHT = 508;
const FIGMA_CARD_WIDTH = 174.301;
const FIGMA_FIELD_HEIGHT = 22.063;
const FIGMA_FIELD_GAP = 3.677;
const FIGMA_FIELD_STACK_GAP = 1.839;
const FIGMA_CARD_RADIUS = 3.677;
const FIGMA_CARD_SHADOW =
  '0px 0px 3.677px rgba(0, 0, 0, 0.08), 0px 1.839px 3.677px rgba(0, 0, 0, 0.04)';
const FIGMA_COLUMN_GAP = 8;
const FIGMA_COLUMN_SIDE_PADDING = 5.516;
const FIGMA_HEADER_PADDING_X = 5.516;
const FIGMA_HEADER_PADDING_TOP = 7.354;
const FIGMA_HEADER_PADDING_BOTTOM = 3.677;
const FIGMA_FIELDS_PADDING_RIGHT = 5.516;
const FIGMA_FIELDS_PADDING_LEFT = 5.516;
const FIGMA_FIELDS_PADDING_BOTTOM = 3.677;
export const FIGMA_CHECKBOX_SIZE = 14;
const FIGMA_ICON_BOX = 14.709;
const FIGMA_TOKEN_MARK_SIZE = 12.87;
const FIGMA_TOKEN_HEIGHT = 18.386;
const HAND_CURSOR_IDLE_POSITION = { x: 132, y: 170 };
const HAND_CURSOR_HOVER_SHIFT_X = 78;
const HAND_CURSOR_HOVER_SHIFT_Y = 10;
const HAND_CURSOR_HOVER_ROTATION_DEG = -6;

export const COLORS = {
  backdrop: '#1b1b1b',
  border: '#ebebeb',
  borderLight: '#f1f1f1',
  borderStrong: '#d6d6d6',
  boardSurface: '#ffffff',
  cardSurface: '#fcfcfc',
  activeCardBorder: '#b5ccff',
  activeCardSurface: '#e8f1ff',
  imageAreaSurface: '#f5f5f3',
  laneCount: '#999999',
  laneLabelPink: '#d6409f',
  laneLabelPinkSurface: '#fce5f3',
  laneLabelPurple: '#8e4ec6',
  laneLabelPurpleSurface: '#ede9fe',
  textLight: '#b3b3b3',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
};

export const VisualRoot = styled.div`
  background: ${COLORS.imageAreaSurface};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

export const SceneViewport = styled.div<{ $sceneScale: number }>`
  height: ${SCENE_HEIGHT}px;
  left: 50%;
  position: absolute;
  top: 0;
  transform: translateX(-50%) scale(${({ $sceneScale }) => $sceneScale});
  transform-origin: top center;
  width: ${SCENE_WIDTH}px;
`;

export const SceneFrame = styled.div`
  background: ${COLORS.backdrop};
  border-radius: 2px;
  height: 508px;
  overflow: hidden;
  position: relative;
  width: 411px;
`;

export const SceneBackdrop = styled.div<{
  $backgroundImageRotationDeg?: number;
}>`
  background-color: ${COLORS.backdrop};
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  transform: rotate(
    ${({ $backgroundImageRotationDeg = 0 }) => $backgroundImageRotationDeg}deg
  );
  transform-origin: center center;
`;

export const BoardGroup = styled.div<{ $active: boolean }>`
  height: 563.255px;
  left: -28px;
  position: absolute;
  top: 101px;
  transform: scale(${({ $active }) => ($active ? 1.014 : 1)});
  transform-origin: center center;
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  width: 412.302px;
  will-change: transform;
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const BoardSurface = styled.div`
  background: ${COLORS.boardSurface};
  border: 1px solid ${COLORS.border};
  border-radius: 7.354px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6);
  display: flex;
  flex-direction: column;
  height: 563.255px;
  overflow: hidden;
  width: 386.453px;
`;

export const BoardTitleRow = styled.div`
  align-items: center;
  background: ${COLORS.boardSurface};
  border-bottom: 1px solid ${COLORS.borderLight};
  display: flex;
  height: 36.772px;
  padding: 7.354px 12px;
`;

export const ViewSwitcher = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  height: 24px;
  min-width: 0;
  padding: 0 4px;
  border-radius: 4px;
  transition: background-color 120ms ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export const ViewSwitcherIcon = styled.span`
  align-items: center;
  color: ${COLORS.textSecondary};
  display: inline-flex;
  flex: 0 0 auto;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const BoardTitleMeta = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
  min-width: 0;
`;

export const BoardTitleText = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

export const BoardTitleDot = styled.span`
  background: ${COLORS.textLight};
  border-radius: 999px;
  display: inline-flex;
  flex: 0 0 auto;
  height: 2px;
  width: 2px;
`;

export const BoardTitleCount = styled.span`
  color: ${COLORS.textLight};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

export const ColumnsHeaderGrid = styled.div`
  background: ${COLORS.boardSurface};
  display: grid;
  grid-template-columns: repeat(2, 186.355px);
  justify-content: center;
  min-height: 29.354px;
  position: relative;
  z-index: 1;
`;

export const LaneHeader = styled.div`
  align-items: flex-start;
  border-right: 1px solid ${COLORS.borderLight};
  display: flex;
  gap: 4px;
  min-height: 29.354px;
  padding: 7.354px ${FIGMA_COLUMN_SIDE_PADDING}px 0;

  &:last-child {
    border-right: none;
  }
`;

export const LanePill = styled.span<{ $tone: 'pink' | 'purple' }>`
  align-items: center;
  background: ${({ $tone }) =>
    $tone === 'pink'
      ? COLORS.laneLabelPinkSurface
      : COLORS.laneLabelPurpleSurface};
  border-radius: 4px;
  color: ${({ $tone }) =>
    $tone === 'pink' ? COLORS.laneLabelPink : COLORS.laneLabelPurple};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  height: 22px;
  padding: 0 8px;
`;

export const LaneCount = styled.span`
  color: ${COLORS.laneCount};
  font-family: ${APP_FONT};
  font-size: 13px;
  line-height: 1.4;
`;

export const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 186.355px);
  justify-content: center;
  flex: 1 1 auto;
  min-height: 0;
`;

export const LaneBody = styled.div`
  border-right: 1px solid ${COLORS.borderLight};
  display: flex;
  flex-direction: column;
  gap: ${FIGMA_COLUMN_GAP}px;
  min-height: 0;
  padding: 7.354px ${FIGMA_COLUMN_SIDE_PADDING}px 8px;

  &:last-child {
    border-right: none;
  }
`;

export const AddCardRow = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  gap: ${FIGMA_FIELD_GAP}px;
  height: ${FIGMA_FIELD_HEIGHT}px;
  padding: 0 4px;
`;

export const OpportunityCard = styled.div<{ $variant?: 'active' | 'board' }>`
  background: ${({ $variant }) =>
    $variant === 'active' ? COLORS.activeCardSurface : COLORS.cardSurface};
  border: ${({ $variant }) => ($variant === 'active' ? '0.919px' : '1px')} solid
    ${({ $variant }) =>
      $variant === 'active' ? COLORS.activeCardBorder : COLORS.border};
  border-radius: ${FIGMA_CARD_RADIUS}px;
  box-shadow: ${FIGMA_CARD_SHADOW};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: background-color 120ms ease;
  width: ${FIGMA_CARD_WIDTH}px;

  &::after {
    background: rgba(0, 0, 0, 0.04);
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 120ms ease;
  }

  @media (hover: hover) {
    &:hover::after {
      opacity: ${({ $variant }) => ($variant === 'board' ? 1 : 0)};
    }
  }
`;

export const CardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 33.095px;
  padding: ${FIGMA_HEADER_PADDING_TOP}px ${FIGMA_HEADER_PADDING_X}px
    ${FIGMA_HEADER_PADDING_BOTTOM}px;
`;

export const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${FIGMA_FIELD_STACK_GAP}px;
  padding: 0 ${FIGMA_FIELDS_PADDING_RIGHT}px ${FIGMA_FIELDS_PADDING_BOTTOM}px
    ${FIGMA_FIELDS_PADDING_LEFT}px;
`;

export const FieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${FIGMA_FIELD_GAP}px;
  min-height: ${FIGMA_FIELD_HEIGHT}px;
`;

export const FieldIcon = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  display: flex;
  flex: 0 0 ${FIGMA_ICON_BOX}px;
  height: ${FIGMA_ICON_BOX}px;
  justify-content: center;
  width: ${FIGMA_ICON_BOX}px;
`;

export const FieldValue = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

export const ValueText = styled.span`
  color: ${COLORS.textPrimary};
  font-family: ${APP_FONT};
  font-size: 11.95px;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CheckboxShell = styled.div`
  align-items: center;
  display: flex;
  height: ${FIGMA_FIELD_HEIGHT}px;
  justify-content: center;
  width: ${FIGMA_FIELD_HEIGHT}px;
`;

export const CheckboxBox = styled.div`
  align-items: center;
  display: flex;
  height: ${FIGMA_CHECKBOX_SIZE}px;
  justify-content: center;
  width: ${FIGMA_CHECKBOX_SIZE}px;
`;

export const TokenChip = styled.span<{ $soft?: boolean }>`
  align-items: center;
  background: ${({ $soft }) => ($soft ? 'rgba(0, 0, 0, 0.04)' : 'transparent')};
  border-radius: 4px;
  display: inline-flex;
  gap: ${FIGMA_FIELD_GAP}px;
  height: ${FIGMA_TOKEN_HEIGHT}px;
  max-width: 100%;
  overflow: hidden;
  padding: ${({ $soft }) =>
    $soft ? '2.758px 3.677px' : '2.758px 3.677px 2.758px 0'};
`;

export const HeaderTokenChip = styled.span`
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 22.063px;
  max-width: 100%;
  overflow: hidden;
  padding: 4px;
`;

export const TokenMark = styled.span<{
  $round?: boolean;
  $tone: TokenTone;
}>`
  align-items: center;
  background: ${({ $tone }) => TOKEN_TONES[$tone].background};
  border-radius: ${({ $round }) => ($round ? '999px' : '3px')};
  color: ${({ $tone }) => TOKEN_TONES[$tone].color};
  display: inline-flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 9.19px;
  font-weight: ${theme.font.weight.medium};
  height: ${FIGMA_TOKEN_MARK_SIZE}px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: ${FIGMA_TOKEN_MARK_SIZE}px;
`;

export const HeaderTokenMark = styled.span<{ $tone: TokenTone }>`
  align-items: center;
  background: ${({ $tone }) => TOKEN_TONES[$tone].background};
  border-radius: 2px;
  color: ${({ $tone }) => TOKEN_TONES[$tone].color};
  display: inline-flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 9.19px;
  font-weight: ${theme.font.weight.medium};
  height: 14px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 14px;
`;

export const TokenPhotoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export const TokenLogoImage = styled.img`
  box-sizing: border-box;
  display: block;
  height: 100%;
  object-fit: contain;
  padding: 1px;
  width: 100%;
`;

export const HeaderTokenLogoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

export const TokenLabel = styled.span`
  color: ${COLORS.textPrimary};
  font-family: ${APP_FONT};
  font-size: 11.95px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HeaderTokenLabel = styled(TokenLabel)`
  font-weight: ${theme.font.weight.medium};
`;

export const RatingRow = styled.div`
  display: inline-flex;
  gap: 1px;
  padding: 0 3.677px;
`;

export const RatingStar = styled.span`
  align-items: center;
  display: inline-flex;
  height: 12px;
  justify-content: center;
  width: 12px;
`;

export const InteractionLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
`;

export const DragCursor = styled.div<{ $active: boolean }>`
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translate3d(
    ${({ $active }) =>
      HAND_CURSOR_IDLE_POSITION.x +
      ($active ? HAND_CURSOR_HOVER_SHIFT_X : 0)}px,
    0,
    0
  );
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  z-index: 4;

  @media (hover: none) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const DragCursorInner = styled.div<{ $active: boolean }>`
  transform: translate3d(
      0,
      ${({ $active }) =>
        HAND_CURSOR_IDLE_POSITION.y +
        ($active ? HAND_CURSOR_HOVER_SHIFT_Y : 0)}px,
      0
    )
    rotate(
      ${({ $active }) => ($active ? HAND_CURSOR_HOVER_ROTATION_DEG : 0)}deg
    );
  transition: transform 520ms cubic-bezier(0.18, 0.9, 0.22, 1.18);
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const LaneDraggableCard = styled.div<{ $dragging: boolean }>`
  touch-action: none;
  user-select: none;

  ${OpportunityCard} {
    cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  }
`;

export const DraggableCardShell = styled.div<{ $dragging: boolean }>`
  left: 0;
  pointer-events: auto;
  position: absolute;
  top: 0;
  touch-action: none;
  user-select: none;
  will-change: transform;
  z-index: 3;

  ${OpportunityCard} {
    cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
  }
`;
