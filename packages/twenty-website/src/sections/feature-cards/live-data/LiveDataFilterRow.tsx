'use client';

import { styled } from '@linaria/react';
import {
  IconHeartHandshake,
  IconPlus,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { type RefObject } from 'react';

import { EASING, FONT_WEIGHT } from '@/tokens';
import { LIVE_DATA_SCENE } from '@/tokens/feature-scenes/live-data-scene';

import { type LiveDataPhase } from './use-live-data-demo-timeline';

const SCENE = LIVE_DATA_SCENE;
const FILTER_ICON_STROKE = 1.33;

const FilterRowShell = styled.div`
  align-items: center;
  border-bottom: 1px solid ${SCENE.colors.rowBorder};
  display: flex;
  gap: 4px;
  height: 48px;
  padding: 0 12px;
  position: relative;
`;

const FilterChipMotion = styled.div<{
  $removing?: boolean;
  $visible: boolean;
}>`
  display: inline-flex;
  max-width: ${({ $visible }) => ($visible ? '172px' : '0')};
  opacity: ${({ $removing, $visible }) => ($visible || $removing ? 1 : 0)};
  overflow: ${({ $removing }) => ($removing ? 'visible' : 'hidden')};
  pointer-events: ${({ $removing, $visible }) =>
    $visible && !$removing ? 'auto' : 'none'};
  transform: ${({ $removing, $visible }) =>
    $visible || $removing
      ? 'translateX(0) scale(1)'
      : 'translateX(-8px) scale(0.92)'};
  transform-origin: right center;
  transition:
    max-width 280ms ${EASING.standard}
      ${({ $removing }) => ($removing ? '180ms' : '0ms')},
    opacity 180ms ease ${({ $removing }) => ($removing ? '180ms' : '0ms')},
    transform 280ms ${EASING.standard}
      ${({ $removing }) => ($removing ? '180ms' : '0ms')};
  white-space: nowrap;
`;

const FilterChip = styled.div<{
  $pressed?: boolean;
  $removing?: boolean;
}>`
  align-items: center;
  background: ${SCENE.colors.blueSurface};
  border: 1px solid ${SCENE.colors.blueBorder};
  border-radius: 4px;
  box-shadow: ${({ $pressed }) =>
    $pressed ? SCENE.colors.filterPressedInset : 'none'};
  color: ${SCENE.colors.blue};
  display: inline-flex;
  font-family: ${SCENE.appFont};
  font-size: 12px;
  gap: 2px;
  height: 24px;
  line-height: 1.4;
  padding: 2px 2px 2px 4px;
  opacity: 1;
  transform: ${({ $pressed }) => ($pressed ? 'scale(0.985)' : 'scale(1)')};
  transition:
    box-shadow 180ms ease,
    transform 180ms ease;
  white-space: nowrap;

  animation: ${({ $removing }) =>
    $removing
      ? `employees-filter-pop-away 320ms ${SCENE.popAwayEase} forwards`
      : 'none'};
  transform-origin: right center;
  will-change: opacity, transform;

  @keyframes employees-filter-pop-away {
    0% {
      opacity: 1;
      transform: scale(0.985) translate3d(0, 0, 0);
    }

    36% {
      opacity: 1;
      transform: scale(1.08) translate3d(2px, -1px, 0);
    }

    100% {
      opacity: 0;
      transform: scale(0.64) translate3d(18px, -6px, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Snap-hide the chip when removing — the decorative pop collapses to
       a single frame. */
    animation-duration: 1ms;
    animation-timing-function: linear;
  }
`;

const FilterChipLabel = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const FilterChipIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const FilterName = styled.span`
  font-size: 12px;
  line-height: 1.4;
  font-weight: ${FONT_WEIGHT.medium};
`;

const FilterValue = styled.span`
  font-size: 12px;
  line-height: 1.4;
  font-weight: ${FONT_WEIGHT.regular};
`;

const FilterCloseButton = styled.button<{ $pressed?: boolean }>`
  align-items: center;
  background: ${({ $pressed }) =>
    $pressed ? SCENE.colors.filterPressedWash : 'transparent'};
  border: 0;
  border-radius: 2px;
  color: ${SCENE.colors.blue};
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  height: 20px;
  justify-content: center;
  padding: 0;
  transition: background-color 140ms ease;
  width: 20px;

  &:hover {
    background: ${({ $pressed }) =>
      $pressed ? SCENE.colors.filterPressedWash : SCENE.colors.filterHoverWash};
  }

  &:focus-visible {
    background: ${SCENE.colors.filterHoverWash};
    outline: none;
  }
`;

const FloatingAddFilter = styled.button<{
  $animated: boolean;
  $left: number;
}>`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 4px;
  color: ${SCENE.colors.muted};
  cursor: pointer;
  display: inline-flex;
  font-family: ${SCENE.appFont};
  font-size: 13px;
  font-weight: ${FONT_WEIGHT.regular};
  gap: 4px;
  height: 24px;
  left: ${({ $left }) => `${$left}px`};
  line-height: 1.4;
  padding: 0 8px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: ${({ $animated }) =>
    $animated
      ? `background-color 120ms ease, left 340ms ${EASING.standard}`
      : 'background-color 120ms ease'};
  white-space: nowrap;

  &:hover {
    background: ${SCENE.colors.softWash};
  }
`;

export function LiveDataFilterRow({
  addFilterLeft,
  isAddFilterAnimated,
  phase,
  typeFilterRef,
  employeesFilterRef,
}: {
  addFilterLeft: number;
  isAddFilterAnimated: boolean;
  phase: LiveDataPhase;
  typeFilterRef: RefObject<HTMLDivElement | null>;
  employeesFilterRef: RefObject<HTMLDivElement | null>;
}) {
  const isEmployeesFilterRemoving = phase === 'remove-filter';
  const isEmployeesFilterVisible =
    phase !== 'remove-filter' && phase !== 'return-bob' && phase !== 'settle';

  return (
    <FilterRowShell>
      <FilterChip ref={typeFilterRef}>
        <FilterChipLabel>
          <FilterChipIcon>
            <IconHeartHandshake
              aria-hidden
              color={SCENE.colors.blue}
              size={14}
              stroke={FILTER_ICON_STROKE}
            />
          </FilterChipIcon>
          <FilterName>Type</FilterName>
        </FilterChipLabel>
        <FilterValue>is Customer</FilterValue>
        <FilterCloseButton type="button">
          <IconX
            aria-hidden
            color={SCENE.colors.blue}
            size={14}
            stroke={FILTER_ICON_STROKE}
          />
        </FilterCloseButton>
      </FilterChip>

      <FilterChipMotion
        ref={employeesFilterRef}
        $removing={isEmployeesFilterRemoving}
        $visible={isEmployeesFilterVisible}
      >
        <FilterChip
          $pressed={phase === 'remove-filter'}
          $removing={isEmployeesFilterRemoving}
        >
          <FilterChipLabel>
            <FilterChipIcon>
              <IconUser
                aria-hidden
                color={SCENE.colors.blue}
                size={14}
                stroke={FILTER_ICON_STROKE}
              />
            </FilterChipIcon>
            <FilterName>Employees</FilterName>
          </FilterChipLabel>
          <FilterValue>{'>500'}</FilterValue>
          <FilterCloseButton $pressed={phase === 'remove-filter'} type="button">
            <IconX
              aria-hidden
              color={SCENE.colors.blue}
              size={14}
              stroke={FILTER_ICON_STROKE}
            />
          </FilterCloseButton>
        </FilterChip>
      </FilterChipMotion>

      <FloatingAddFilter
        $animated={isAddFilterAnimated}
        $left={addFilterLeft}
        type="button"
      >
        <FilterChipIcon>
          <IconPlus
            aria-hidden
            color={SCENE.colors.muted}
            size={14}
            stroke={FILTER_ICON_STROKE}
          />
        </FilterChipIcon>
        Add filter
      </FloatingAddFilter>
    </FilterRowShell>
  );
}
