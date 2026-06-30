'use client';

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
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';

import { useTimeoutRegistry } from '@/app-preview/stage/use-timeout-registry';
import { useScaleToFit } from '@/platform/motion';
import { HalftoneCardBackdrop } from '@/platform/visuals/rigs/HalftoneCardBackdrop';
import { EASING, FONT_WEIGHT } from '@/tokens';
import { FAST_PATH_SCENE } from '@/tokens/feature-scenes/fast-path-scene';

import { DENSE_CONFETTI_PARTICLES } from './fast-path-confetti-data';
import { PreviewCursorIcon } from './PreviewCursorIcon';

const SCENE = FAST_PATH_SCENE;
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

const VisualRoot = styled.div`
  background: ${SCENE.colors.black};
  height: 100%;
  isolation: isolate;
  overflow: hidden;
  position: relative;
  width: 100%;
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

// Fixed 411x508 design box, centered, scaled uniformly — same viewport
// contract as the other two scenes. The PreviewSurface extends past the
// box; the card frame's overflow clips the excess.
const ScaledScene = styled.div<{ $sceneScale: number }>`
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
  animation: confetti-burst ${CONFETTI_ANIMATION_MS}ms ${EASING.standard}
    forwards;
  animation-delay: ${({ $delay }) => `${$delay}ms`};
  background: ${({ $color }) => $color};
  border-radius: ${({ $radius }) => `${$radius}px`};
  box-shadow: ${SCENE.colors.confettiShadow};
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
    /* Confetti is purely decorative — the form-submit success state is
       still conveyed by the surrounding visual change. */
    animation: none;
    opacity: 0;
  }
`;

const PreviewSurface = styled.div<{ $active?: boolean }>`
  background-color: ${SCENE.colors.panel};
  border-radius: 6px;
  bottom: -92px;
  box-shadow: ${SCENE.colors.panelShadow};
  height: 552px;
  isolation: isolate;
  overflow: hidden;
  position: absolute;
  right: -82px;
  transform: ${({ $active }) => ($active ? 'scale(1.04)' : 'scale(1)')};
  transform-origin: center center;
  transition: transform 260ms ${EASING.standard};
  width: 378px;

  &::before {
    background-image: url('${SCENE.noiseImageUrl}');
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
  border: 1px solid ${SCENE.colors.transparentMedium};
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.medium};
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
    background: ${SCENE.colors.surfaceHover};
  }
`;

const ActionIcon = styled.span`
  align-items: center;
  color: ${SCENE.colors.textSecondary};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const ActionLabel = styled.span<{ $muted?: boolean }>`
  color: ${({ $muted }) =>
    $muted ? SCENE.colors.muted : SCENE.colors.textSecondary};
  font-family: inherit;
  font-size: inherit;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
  white-space: nowrap;
`;

const ShortcutDivider = styled.div`
  background: ${SCENE.colors.surfaceHover};
  border-radius: 999px;
  height: 100%;
  width: 1px;
`;

const CommandPalette = styled.div`
  background: ${SCENE.colors.panel};
  border: 1px solid ${SCENE.colors.border};
  border-radius: 9px;
  bottom: 14px;
  box-shadow: 0 0 0 1px ${SCENE.colors.shadow};
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
  border-bottom: 1px solid ${SCENE.colors.borderLight};
  display: grid;
  gap: 8px;
  grid-template-columns: 16px minmax(0, 1fr) 16px;
  padding: 0 12px;
`;

const SearchPlaceholder = styled.span`
  color: ${SCENE.colors.mutedStrong};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.regular};
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
  color: ${SCENE.colors.muted};
  font-family: ${SCENE.appFont};
  font-size: 11px;
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1;
  padding: 10px 4px 4px;
`;

const MenuItem = styled.div<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? SCENE.colors.surfaceHover : 'transparent'};
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
    background: ${SCENE.colors.surfaceHover};
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
  color: ${SCENE.colors.textSecondary};
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuIconBox = styled.div`
  align-items: center;
  background: ${SCENE.colors.surfaceHover};
  border-radius: 4px;
  color: ${SCENE.colors.mutedStrong};
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const ShortcutHint = styled.div`
  align-items: center;
  color: ${SCENE.colors.muted};
  display: inline-flex;
  font-family: ${SCENE.appFont};
  font-size: 12px;
  font-weight: ${FONT_WEIGHT.regular};
  gap: 4px;
  line-height: 1.4;
  white-space: nowrap;
`;

const ShortcutKey = styled.span`
  align-items: center;
  border: 1px solid ${SCENE.colors.shortcutKeyBorder};
  border-radius: 4px;
  color: ${SCENE.colors.mutedStrong};
  display: inline-flex;
  font-weight: ${FONT_WEIGHT.medium};
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
  color: ${SCENE.colors.mutedStrong};
  display: flex;
  justify-content: center;
`;

export function FastPathVisual({
  active,
  backgroundImageSrc,
  pointerTargetRef,
}: {
  active?: boolean;
  backgroundImageSrc: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
}) {
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
      <SceneBackdrop>
        <HalftoneCardBackdrop
          active={active}
          config={SCENE.backdrop}
          imageUrl={backgroundImageSrc}
          pointerTargetRef={pointerTargetRef ?? rootRef}
        />
      </SceneBackdrop>
      <SceneBackdrop>
        {confettiBursts.map((burst) => (
          <ConfettiBurstLayer key={burst.id}>
            {DENSE_CONFETTI_PARTICLES.map((particle, index) => {
              // The particle's position in the authored field IS its
              // identity within a burst (the array is static).
              const particleNumber = index + 1;

              return (
                <ConfettiParticle
                  $color={particle.color}
                  $delay={particle.delay}
                  $height={particle.height}
                  $left={
                    burst.left +
                    (particle.left - CONFETTI_BASE_LEFT) *
                      CONFETTI_START_OFFSET_X
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
                  key={`${burst.id}-${particleNumber}`}
                />
              );
            })}
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
                color={SCENE.colors.mutedStrong}
                size={16}
                stroke={TOOLBAR_TABLER_STROKE}
              />
              <SearchPlaceholder>Type anything...</SearchPlaceholder>
              <SearchSparkles>
                <IconSparkles
                  color={SCENE.colors.mutedStrong}
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
