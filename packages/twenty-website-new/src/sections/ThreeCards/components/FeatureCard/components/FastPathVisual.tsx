'use client';

import { useTimeoutRegistry } from '@/lib/react';
import { WebGlMount } from '@/lib/visual-runtime';
import { useScaleToFit } from '@/sections/ThreeCards/utils/use-scale-to-fit';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconArrowUpRight,
  IconBuildingSkyscraper,
  IconChevronDown,
  IconChevronLeft,
  IconChevronUp,
  IconDatabaseExport,
  IconDatabaseImport,
  IconDotsVertical,
  IconMail,
  IconMoon,
  IconPlus,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react';
import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useRef,
  useState,
} from 'react';
import { DENSE_CONFETTI_PARTICLES } from '../utils/fast-path-confetti.data';
import { FastPathGradientBackdrop } from './FastPathGradientBackdrop';

const APP_FONT = `'Inter', ${theme.font.family.sans}`;
const FAST_PATH_NOISE_BACKGROUND =
  'url("/images/home/three-cards-feature/fast-path-background-noise.webp")';
const SCENE_DESIGN_WIDTH = 411;
const SCENE_DESIGN_HEIGHT = 508;
const TOOLBAR_VERTICAL_PADDING = 16;
const ACTION_BUTTON_HEIGHT = 24;
const TOOLBAR_TOTAL_HEIGHT =
  ACTION_BUTTON_HEIGHT + TOOLBAR_VERTICAL_PADDING * 2;
const TOOLBAR_TABLER_STROKE = 1.55;
const MENU_ICON_SIZE = 16;
const MENU_TABLER_STROKE = 2;
const CONFETTI_ANIMATION_MS = 1120;
const CONFETTI_CLEANUP_MS = CONFETTI_ANIMATION_MS + 320;
const CONFETTI_SPREAD_X = 1.18;
const CONFETTI_SPREAD_Y = 1.14;
const CONFETTI_BASE_LEFT = 56;
const CONFETTI_BASE_TOP = 30;
const CONFETTI_START_OFFSET_X = 6;
const CONFETTI_START_OFFSET_Y = 6;
const CONFETTI_ORIGIN_OFFSET_FROM_PREVIEW = 12;

type FastPathVisualProps = {
  active?: boolean;
  backgroundImageRotationDeg?: number;
  backgroundImageSrc?: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

const COLORS = {
  black: '#111111',
  border: '#ebebeb',
  borderLight: '#f1f1f1',
  muted: '#b3b3b3',
  mutedStrong: '#999999',
  offWhite: '#f8f7f2',
  panel: '#ffffff',
  shadow: 'rgba(241, 241, 241, 0.9)',
  surfaceHover: 'rgba(0, 0, 0, 0.04)',
  textSecondary: '#666666',
  transparentMedium: 'rgba(0, 0, 0, 0.08)',
} as const;

const VisualRoot = styled.div`
  background: ${COLORS.black};
  height: 100%;
  isolation: isolate;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const AnimatedBackdrop = styled.div<{
  $backgroundImageRotationDeg?: number;
}>`
  inset: 0;
  overflow: hidden;
  position: absolute;
  transform: rotate(
    ${({ $backgroundImageRotationDeg = 0 }) => $backgroundImageRotationDeg}deg
  );
  transform-origin: center center;
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
`;

const SceneBackdrop = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`;

const ConfettiBurstLayer = styled.div`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
`;

const ScaledScene = styled.div<{ $sceneScale: number }>`
  /*
   * Fixed 411 × 508 design box, centered, scaled uniformly. Matches the
   * SceneViewport of FamiliarInterface and LiveData so all three feature
   * cards render their scenes at pixel-identical proportions. The
   * PreviewSurface inside uses bottom: -92px / right: -82px to extend past
   * the scene box; the excess is clipped by CardImageFrame's overflow:hidden.
   */
  height: ${SCENE_DESIGN_HEIGHT}px;
  left: 50%;
  position: absolute;
  top: 0;
  transform: translateX(-50%) scale(${({ $sceneScale }) => $sceneScale});
  transform-origin: top center;
  width: ${SCENE_DESIGN_WIDTH}px;
`;

const ConfettiParticle = styled.div<{
  $color: string;
  $delay: number;
  $height: number;
  $left: number;
  $radius: number;
  $rotation: number;
  $top: number;
  $tx: number;
  $ty: number;
  $width: number;
}>`
  --confetti-rotation: ${({ $rotation }) => `${$rotation}deg`};
  --confetti-translate-x: ${({ $tx }) => `${$tx}px`};
  --confetti-translate-y: ${({ $ty }) => `${$ty}px`};
  animation: confetti-burst ${CONFETTI_ANIMATION_MS}ms
    cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $delay }) => `${$delay}ms`};
  background: ${({ $color }) => $color};
  border-radius: ${({ $radius }) => `${$radius}px`};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  height: ${({ $height }) => `${$height}px`};
  left: ${({ $left }) => `${$left}px`};
  opacity: 0;
  position: absolute;
  top: ${({ $top }) => `${$top}px`};
  transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(0deg) scale(0.55);
  width: ${({ $width }) => `${$width}px`};

  @keyframes confetti-burst {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(0deg)
        scale(0.55);
    }

    14% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate(-50%, -50%)
        translate3d(
          calc(var(--confetti-translate-x) * ${CONFETTI_SPREAD_X}),
          calc(var(--confetti-translate-y) * ${CONFETTI_SPREAD_Y}),
          0
        )
        rotate(var(--confetti-rotation)) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Confetti is purely decorative — the form-submit success state is still
       conveyed by the surrounding visual change. */
    animation: none;
    opacity: 0;
  }
`;

const PreviewSurface = styled.div<{ $active?: boolean }>`
  background-color: ${COLORS.panel};
  border-radius: 6px;
  bottom: -92px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.16),
    0 20px 48px rgba(0, 0, 0, 0.28);
  height: 552px;
  isolation: isolate;
  overflow: hidden;
  position: absolute;
  right: -82px;
  transform: ${({ $active }) => ($active ? 'scale(1.04)' : 'scale(1)')};
  transform-origin: center center;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  width: 378px;

  &::before {
    background-image: ${FAST_PATH_NOISE_BACKGROUND};
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    content: '';
    inset: 0;
    opacity: 0.08;
    pointer-events: none;
    position: absolute;
  }

  &:hover [data-preview-active='true']:not(:hover) {
    background: transparent;
  }

  &:hover [data-preview-cursor='true'] {
    opacity: 0;
  }
`;

const ToolbarRow = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  left: 0;
  padding: ${TOOLBAR_VERTICAL_PADDING}px 19px;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
`;

const ActionButton = styled.div<{ $iconOnly?: boolean }>`
  align-items: center;
  background: transparent;
  border: 1px solid ${COLORS.transparentMedium};
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  gap: ${({ $iconOnly }) => ($iconOnly ? '2px' : '4px')};
  height: 24px;
  justify-content: center;
  width: ${({ $iconOnly }) => ($iconOnly ? '24px' : 'auto')};
  min-width: ${({ $iconOnly }) => ($iconOnly ? '24px' : 'auto')};
  padding: ${({ $iconOnly }) => ($iconOnly ? '0' : '0 8px')};
  transition: background 0.1s ease;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background: ${COLORS.surfaceHover};
  }
`;

const ActionIcon = styled.span`
  align-items: center;
  color: ${COLORS.textSecondary};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const ActionLabel = styled.span<{ $muted?: boolean }>`
  color: ${({ $muted }) => ($muted ? COLORS.muted : COLORS.textSecondary)};
  font-family: inherit;
  font-size: inherit;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ShortcutDivider = styled.div`
  background: rgba(0, 0, 0, 0.04);
  border-radius: 999px;
  height: 100%;
  width: 1px;
`;

const CommandPalette = styled.div`
  background: ${COLORS.panel};
  border: 1px solid ${COLORS.border};
  border-radius: 9px;
  bottom: 14px;
  box-shadow: 0 0 0 1px ${COLORS.shadow};
  display: grid;
  grid-template-rows: 42px minmax(0, 1fr);
  left: 14px;
  overflow: hidden;
  position: absolute;
  right: 14px;
  top: ${TOOLBAR_TOTAL_HEIGHT}px;
  z-index: 1;
`;

const SearchRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${COLORS.borderLight};
  display: grid;
  gap: 8px;
  grid-template-columns: 16px minmax(0, 1fr) 16px;
  padding: 0 12px;
`;

const SearchPlaceholder = styled.span`
  color: ${COLORS.mutedStrong};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PaletteBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
`;

const SectionLabel = styled.div`
  color: ${COLORS.muted};
  font-family: ${APP_FONT};
  font-size: 11px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1;
  padding: 10px 4px 4px;
`;

const MenuItem = styled.div<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? COLORS.surfaceHover : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: grid;
  gap: 8px;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  min-height: 33px;
  padding: 0 4px;
  position: relative;
  transition: background 0.1s ease;
  user-select: none;

  &:hover {
    background: ${COLORS.surfaceHover};
  }
`;

const PreviewCursor = styled.div`
  height: 32px;
  left: 34px;
  opacity: 1;
  pointer-events: none;
  position: absolute;
  top: 19px;
  transition: opacity 0.1s ease;
  width: 32px;
  z-index: 2;
`;

const MenuItemLabel = styled.span`
  color: ${COLORS.textSecondary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuIconBox = styled.div`
  align-items: center;
  background: ${COLORS.surfaceHover};
  border-radius: 4px;
  color: ${COLORS.mutedStrong};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const ShortcutHint = styled.div`
  align-items: center;
  color: ${COLORS.muted};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 12px;
  font-weight: ${theme.font.weight.regular};
  gap: 4px;
  line-height: 1.4;
  white-space: nowrap;
`;

const ShortcutKey = styled.span`
  align-items: center;
  border: 1px solid #dddddd;
  border-radius: 4px;
  color: ${COLORS.mutedStrong};
  display: inline-flex;
  font-weight: ${theme.font.weight.medium};
  height: 18px;
  justify-content: center;
  min-width: 18px;
  padding: 0 4px;
`;

const SectionSpacer = styled.div`
  height: 2px;
`;

const SearchSparkles = styled.div`
  align-items: center;
  color: ${COLORS.mutedStrong};
  display: flex;
  justify-content: center;
`;

function PreviewCursorIcon() {
  return (
    <svg
      fill="none"
      height="32"
      viewBox="0 0 17 18"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#fast-path-preview-cursor-shadow)">
        <path
          d="M4.07865 12.2682C3.79865 11.9082 3.44865 11.1782 2.83865 10.2682C2.48865 9.76821 1.62865 8.81821 1.36865 8.32821C1.18122 8.03044 1.12683 7.66786 1.21865 7.32821C1.37561 6.68242 1.98821 6.25403 2.64865 6.32821C3.15945 6.43082 3.62887 6.68118 3.99865 7.04821C4.25683 7.29138 4.49432 7.55563 4.70865 7.83821C4.86865 8.03821 4.90865 8.11821 5.08865 8.34821C5.26865 8.57821 5.38865 8.80821 5.29865 8.46821C5.22865 7.96821 5.10865 7.12821 4.93865 6.37821C4.80865 5.80821 4.77865 5.71821 4.65865 5.28821C4.53865 4.85821 4.46865 4.49821 4.33865 4.00821C4.21982 3.52678 4.12635 3.03944 4.05865 2.54821C3.9326 1.91991 4.0243 1.26742 4.31865 0.698209C4.66804 0.369578 5.18058 0.282841 5.61865 0.478209C6.05925 0.803545 6.38775 1.25786 6.55865 1.77821C6.82071 2.4186 6.99561 3.09127 7.07865 3.77821C7.23865 4.77821 7.54865 6.23821 7.55865 6.53821C7.55865 6.16821 7.48865 5.38821 7.55865 5.03821C7.628 4.67333 7.88161 4.37052 8.22865 4.23821C8.52646 4.14683 8.84149 4.12629 9.14865 4.17821C9.45869 4.24302 9.73331 4.42135 9.91865 4.67821C10.1503 5.2616 10.2789 5.88081 10.2986 6.50821C10.3254 5.9588 10.4195 5.41474 10.5786 4.88821C10.7458 4.65276 10.9898 4.483 11.2686 4.40821C11.5992 4.34776 11.9381 4.34776 12.2686 4.40821C12.5397 4.49884 12.7769 4.66972 12.9486 4.89821C13.1604 5.42855 13.2886 5.98855 13.3286 6.55821C13.3286 6.69821 13.3986 6.16821 13.6186 5.81821C13.733 5.47881 14.0197 5.22618 14.3708 5.15548C14.7219 5.08479 15.084 5.20678 15.3208 5.47548C15.5575 5.74419 15.633 6.11881 15.5186 6.45821C15.5186 7.10821 15.5186 7.07821 15.5186 7.51821C15.5186 7.95821 15.5186 8.34821 15.5186 8.71821C15.4822 9.30339 15.402 9.88502 15.2786 10.4582C15.1046 10.9653 14.8624 11.4464 14.5586 11.8882C14.0731 12.4282 13.6719 13.0384 13.3686 13.6982C13.2934 14.026 13.2598 14.362 13.2686 14.6982C13.2676 15.0088 13.308 15.3182 13.3886 15.6182C12.9798 15.6614 12.5675 15.6614 12.1586 15.6182C11.7686 15.5582 11.2886 14.7782 11.1586 14.5382C11.0943 14.4093 10.9627 14.3279 10.8186 14.3279C10.6746 14.3279 10.543 14.4093 10.4786 14.5382C10.2586 14.9182 9.76865 15.6082 9.42865 15.6482C8.75865 15.7282 7.37865 15.6482 6.28865 15.6482C6.28865 15.6482 6.46865 14.6482 6.05865 14.2882C5.64865 13.9282 5.22865 13.5082 4.91865 13.2282L4.07865 12.2682Z"
          fill="white"
        />
        <path
          clipRule="evenodd"
          d="M4.07865 12.2682C3.79865 11.9082 3.44865 11.1782 2.83865 10.2682C2.48865 9.76821 1.62865 8.81821 1.36865 8.32821C1.18122 8.03044 1.12683 7.66786 1.21865 7.32821C1.37561 6.68242 1.98821 6.25403 2.64865 6.32821C3.15945 6.43082 3.62887 6.68118 3.99865 7.04821C4.25683 7.29138 4.49432 7.55563 4.70865 7.83821C4.86865 8.03821 4.90865 8.11821 5.08865 8.34821C5.26865 8.57821 5.38865 8.80821 5.29865 8.46821C5.22865 7.96821 5.10865 7.12821 4.93865 6.37821C4.80865 5.80821 4.77865 5.71821 4.65865 5.28821C4.53865 4.85821 4.46865 4.49821 4.33865 4.00821C4.21982 3.52678 4.12635 3.03944 4.05865 2.54821C3.9326 1.91991 4.0243 1.26742 4.31865 0.698209C4.66804 0.369578 5.18058 0.282841 5.61865 0.478209C6.05925 0.803545 6.38775 1.25786 6.55865 1.77821C6.82071 2.4186 6.99561 3.09127 7.07865 3.77821C7.23865 4.77821 7.54865 6.23821 7.55865 6.53821C7.55865 6.16821 7.48865 5.38821 7.55865 5.03821C7.628 4.67333 7.88161 4.37052 8.22865 4.23821C8.52646 4.14683 8.84149 4.12629 9.14865 4.17821C9.45869 4.24302 9.73331 4.42135 9.91865 4.67821C10.1503 5.2616 10.2789 5.88081 10.2986 6.50821C10.3254 5.9588 10.4195 5.41474 10.5786 4.88821C10.7458 4.65276 10.9898 4.483 11.2686 4.40821C11.5992 4.34776 11.9381 4.34776 12.2686 4.40821C12.5397 4.49884 12.7769 4.66972 12.9486 4.89821C13.1604 5.42855 13.2886 5.98855 13.3286 6.55821C13.3286 6.69821 13.3986 6.16821 13.6186 5.81821C13.733 5.47881 14.0197 5.22618 14.3708 5.15548C14.7219 5.08479 15.084 5.20678 15.3208 5.47548C15.5575 5.74419 15.633 6.11881 15.5186 6.45821C15.5186 7.10821 15.5186 7.07821 15.5186 7.51821C15.5186 7.95821 15.5186 8.34821 15.5186 8.71821C15.4822 9.30339 15.402 9.88502 15.2786 10.4582C15.1046 10.9653 14.8624 11.4464 14.5586 11.8882C14.0731 12.4282 13.6719 13.0384 13.3686 13.6982C13.2934 14.026 13.2598 14.362 13.2686 14.6982C13.2676 15.0088 13.308 15.3182 13.3886 15.6182C12.9798 15.6614 12.5675 15.6614 12.1586 15.6182C11.7686 15.5582 11.2886 14.7782 11.1586 14.5382C11.0943 14.4093 10.9627 14.3279 10.8186 14.3279C10.6746 14.3279 10.543 14.4093 10.4786 14.5382C10.2586 14.9182 9.76865 15.6082 9.42865 15.6482C8.75865 15.7282 7.37865 15.6482 6.28865 15.6482C6.28865 15.6482 6.46865 14.6482 6.05865 14.2882C5.64865 13.9282 5.22865 13.5082 4.91865 13.2282L4.07865 12.2682Z"
          fillRule="evenodd"
          stroke="#202125"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.75"
        />
        <path
          d="M12.5587 12.8142V9.36239C12.5587 9.15578 12.3908 8.98828 12.1837 8.98828C11.9765 8.98828 11.8087 9.15578 11.8087 9.36239V12.8142C11.8087 13.0208 11.9765 13.1883 12.1837 13.1883C12.3908 13.1883 12.5587 13.0208 12.5587 12.8142Z"
          fill="#202125"
        />
        <path
          d="M10.5786 12.8129L10.5586 9.35935C10.5575 9.15323 10.3886 8.9871 10.1815 8.98829C9.97439 8.98948 9.80747 9.15753 9.80866 9.36365L9.82866 12.8172C9.82985 13.0233 9.99871 13.1895 10.2058 13.1883C10.4129 13.1871 10.5798 13.019 10.5786 12.8129Z"
          fill="#202125"
        />
        <path
          d="M7.80866 9.36727L7.82866 12.8137C7.82987 13.0218 7.99874 13.1895 8.20584 13.1883C8.41294 13.1871 8.57986 13.0174 8.57865 12.8093L8.55865 9.36288C8.55744 9.15478 8.38857 8.98707 8.18147 8.98829C7.97437 8.9895 7.80745 9.15918 7.80866 9.36727Z"
          fill="#202125"
        />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="17.8588"
          id="fast-path-preview-cursor-shadow"
          width="16.7461"
          x="-0.000012219"
          y="0"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.4" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
          />
          <feBlend
            in2="BackgroundImageFix"
            mode="normal"
            result="effect1_dropShadow_818_30922"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_818_30922"
            mode="normal"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function FastPathVisual({
  active,
  backgroundImageRotationDeg,
  backgroundImageSrc,
  pointerTargetRef,
}: FastPathVisualProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewSurfaceRef = useRef<HTMLDivElement>(null);
  const timeoutRegistry = useTimeoutRegistry();
  const [confettiBursts, setConfettiBursts] = useState<
    Array<{ id: number; left: number; top: number }>
  >([]);
  const [nextConfettiBurstId, setNextConfettiBurstId] = useState(1);
  const sceneScale = useScaleToFit(
    rootRef,
    SCENE_DESIGN_WIDTH,
    SCENE_DESIGN_HEIGHT,
  );

  const handleCommandClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const burstId = nextConfettiBurstId;
    const rootElement = rootRef.current;
    const previewSurfaceElement = previewSurfaceRef.current;

    let burstLeft = 176;
    let burstTop = 160;

    if (rootElement && previewSurfaceElement) {
      const rootRect = rootElement.getBoundingClientRect();
      const previewSurfaceRect = previewSurfaceElement.getBoundingClientRect();
      const targetRect = event.currentTarget.getBoundingClientRect();

      burstLeft = Math.max(
        24,
        previewSurfaceRect.left -
          rootRect.left -
          CONFETTI_ORIGIN_OFFSET_FROM_PREVIEW,
      );
      burstTop = Math.max(
        24,
        Math.min(
          rootRect.height - 24,
          targetRect.top - rootRect.top + targetRect.height / 2,
        ),
      );
    }

    setNextConfettiBurstId((currentBurstId) => currentBurstId + 1);
    setConfettiBursts((currentBursts) => [
      ...currentBursts,
      { id: burstId, left: burstLeft, top: burstTop },
    ]);

    timeoutRegistry.schedule(() => {
      setConfettiBursts((currentBursts) =>
        currentBursts.filter((currentBurst) => currentBurst.id !== burstId),
      );
    }, CONFETTI_CLEANUP_MS);
  };

  return (
    <VisualRoot aria-hidden ref={rootRef}>
      <AnimatedBackdrop
        $backgroundImageRotationDeg={backgroundImageRotationDeg}
      >
        <WebGlMount detachFromLayout>
          <FastPathGradientBackdrop
            active={active}
            imageUrl={backgroundImageSrc}
            pointerTargetRef={pointerTargetRef ?? rootRef}
          />
        </WebGlMount>
      </AnimatedBackdrop>
      <SceneBackdrop>
        {confettiBursts.map((burst) => (
          <ConfettiBurstLayer key={burst.id}>
            {DENSE_CONFETTI_PARTICLES.map((particle, index) => (
              <ConfettiParticle
                $color={particle.color}
                $delay={particle.delay}
                $height={particle.height}
                $left={
                  burst.left +
                  (particle.left - CONFETTI_BASE_LEFT) * CONFETTI_START_OFFSET_X
                }
                $radius={particle.radius}
                $rotation={particle.rotation}
                $top={
                  burst.top +
                  (particle.top - CONFETTI_BASE_TOP) * CONFETTI_START_OFFSET_Y
                }
                $tx={particle.tx}
                $ty={particle.ty}
                $width={particle.width}
                key={`${burst.id}-${index}`}
              />
            ))}
          </ConfettiBurstLayer>
        ))}
      </SceneBackdrop>
      <ScaledScene $sceneScale={sceneScale}>
        <PreviewSurface $active={active} ref={previewSurfaceRef}>
          <ToolbarRow>
            <ActionButton>
              <ActionIcon>
                <IconPlus size={14} stroke={TOOLBAR_TABLER_STROKE} />
              </ActionIcon>
              <ActionLabel>New Record</ActionLabel>
            </ActionButton>
            <ActionButton $iconOnly>
              <ActionIcon>
                <IconChevronUp size={16} stroke={TOOLBAR_TABLER_STROKE} />
              </ActionIcon>
            </ActionButton>
            <ActionButton $iconOnly>
              <ActionIcon>
                <IconChevronDown size={16} stroke={TOOLBAR_TABLER_STROKE} />
              </ActionIcon>
            </ActionButton>
            <ActionButton>
              <ActionIcon>
                <IconDotsVertical size={14} stroke={TOOLBAR_TABLER_STROKE} />
              </ActionIcon>
              <ShortcutDivider />
              <ActionLabel $muted>⌘K</ActionLabel>
            </ActionButton>
          </ToolbarRow>

          <CommandPalette>
            <SearchRow>
              <IconChevronLeft
                color={COLORS.mutedStrong}
                size={16}
                stroke={TOOLBAR_TABLER_STROKE}
              />
              <SearchPlaceholder>Type anything...</SearchPlaceholder>
              <SearchSparkles>
                <IconSparkles
                  color={COLORS.mutedStrong}
                  size={14}
                  stroke={TOOLBAR_TABLER_STROKE}
                />
              </SearchSparkles>
            </SearchRow>

            <PaletteBody>
              <SectionLabel>Record Selection</SectionLabel>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconMail size={MENU_ICON_SIZE} stroke={MENU_TABLER_STROKE} />
                </MenuIconBox>
                <MenuItemLabel>Send email</MenuItemLabel>
              </MenuItem>
              <MenuItem
                $active
                data-preview-active="true"
                onClick={handleCommandClick}
              >
                <PreviewCursor data-preview-cursor="true">
                  <PreviewCursorIcon />
                </PreviewCursor>
                <MenuIconBox>
                  <IconDatabaseExport
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Export selection as CSV</MenuItemLabel>
              </MenuItem>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconTrash
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Delete 8 records</MenuItemLabel>
              </MenuItem>

              <SectionLabel>&quot;Companies&quot; object</SectionLabel>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconDatabaseImport
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Import data</MenuItemLabel>
              </MenuItem>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconBuildingSkyscraper
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Create company</MenuItemLabel>
              </MenuItem>

              <SectionLabel>Navigate</SectionLabel>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconArrowUpRight
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Go to People</MenuItemLabel>
                <ShortcutHint>
                  <ShortcutKey>G</ShortcutKey>
                  then
                  <ShortcutKey>P</ShortcutKey>
                </ShortcutHint>
              </MenuItem>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconArrowUpRight
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Go to Opportunities</MenuItemLabel>
                <ShortcutHint>
                  <ShortcutKey>G</ShortcutKey>
                  then
                  <ShortcutKey>O</ShortcutKey>
                </ShortcutHint>
              </MenuItem>

              <SectionLabel>Settings</SectionLabel>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconArrowUpRight
                    size={MENU_ICON_SIZE}
                    stroke={MENU_TABLER_STROKE}
                  />
                </MenuIconBox>
                <MenuItemLabel>Go to settings</MenuItemLabel>
                <ShortcutHint>
                  <ShortcutKey>G</ShortcutKey>
                  then
                  <ShortcutKey>S</ShortcutKey>
                </ShortcutHint>
              </MenuItem>
              <MenuItem onClick={handleCommandClick}>
                <MenuIconBox>
                  <IconMoon size={MENU_ICON_SIZE} stroke={MENU_TABLER_STROKE} />
                </MenuIconBox>
                <MenuItemLabel>Switch to dark mode</MenuItemLabel>
              </MenuItem>
              <SectionSpacer />
              <SectionSpacer />
            </PaletteBody>
          </CommandPalette>
        </PreviewSurface>
      </ScaledScene>
    </VisualRoot>
  );
}
