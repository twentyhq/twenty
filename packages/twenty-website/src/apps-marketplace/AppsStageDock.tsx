'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, type PointerEvent, useRef } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { AppsStageLogoTile } from './AppsStageLogoTile';
import { appsStageDockLayout } from './apps-stage-dock-layout';
import { type AppsStageLogoInk } from './apps-stage-logo-ink';
import { type MarketplaceApp } from './marketplace-app';

// PROTOTYPE (?direction=d): the apps' logos, large, standing in one composed
// row. Depth is focus: the middle is sharp, the ends recede. From md up the
// focus follows the pointer.
const MAX_DOCK_APPS = 9;

const Dock = styled.div`
  --apps-stage-unit: min(80px, 20vw);
  height: calc(
    var(--apps-stage-unit) *
      (var(--apps-stage-grid-rows) * ${appsStageDockLayout.gridPitch} - 0.14)
  );
  position: relative;

  ${mediaUp('md')} {
    --apps-stage-unit: min(
      132px,
      calc((100vw - ${spacing(20)}) / var(--apps-stage-row-width))
    );
    height: calc(var(--apps-stage-unit) * 1.56);
  }
`;

const Slot = styled.div`
  --apps-stage-x: var(--apps-stage-grid-x);
  --apps-stage-y: var(--apps-stage-grid-y);
  --apps-stage-scale: 1;
  --apps-stage-focus: 1;
  --apps-stage-tile-size: var(--apps-stage-unit);
  bottom: 0;
  height: var(--apps-stage-unit);
  left: 50%;
  position: absolute;
  transform: translate(
    calc(-50% + var(--apps-stage-x) * var(--apps-stage-unit)),
    calc(var(--apps-stage-y) * var(--apps-stage-unit))
  );
  transition: transform ${DURATION.lg} ${EASING.standard};
  width: var(--apps-stage-unit);

  ${mediaUp('md')} {
    --apps-stage-x: var(--apps-stage-row-x);
    --apps-stage-y: var(--apps-stage-row-y);
    --apps-stage-scale: var(--apps-stage-row-scale);
    --apps-stage-focus: var(--apps-stage-row-focus);
  }

  &[data-active] {
    --apps-stage-tile-edge: ${color('white-40')};
    z-index: 1;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Scaler = styled.div`
  filter: blur(calc((1 - var(--apps-stage-focus)) * 3px));
  height: 100%;
  opacity: calc(0.42 + 0.58 * var(--apps-stage-focus));
  transform: scale(var(--apps-stage-scale));
  transform-origin: 50% 100%;
  transition:
    transform ${DURATION.lg} ${EASING.standard},
    filter ${DURATION.lg} ${EASING.standard},
    opacity ${DURATION.lg} ${EASING.gentle};

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// Middle first, then outwards: the row opens from its focus.
const Entrance = styled.div`
  animation: apps-stage-tile-enter calc(${DURATION.xl} * 1.5) ${EASING.standard}
    both;
  animation-delay: calc(var(--apps-stage-rank) * 90ms + 250ms);
  height: 100%;

  @keyframes apps-stage-tile-enter {
    from {
      filter: blur(10px);
      opacity: 0;
      transform: translateY(32px) scale(0.9);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const TileLink = styled(LocalizedLink)`
  border-radius: 9%;
  display: block;
  height: 100%;
  transition: transform ${DURATION.xxs} ${EASING.standard};

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 4px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Label = styled.span`
  color: ${semanticColor.ink};
  display: none;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  left: 50%;
  letter-spacing: 0.06em;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  text-transform: uppercase;
  top: calc(100% + ${spacing(5)});
  transform: translate(-50%, -4px);
  transition:
    opacity ${DURATION.xxs} ${EASING.gentle},
    transform ${DURATION.xs} ${EASING.standard};
  white-space: nowrap;

  ${mediaUp('md')} {
    display: block;
  }

  [data-active] > &,
  :focus-within > & {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

type DockStyle = CSSProperties & {
  '--apps-stage-row-width': number;
  '--apps-stage-grid-rows': number;
};

type SlotStyle = CSSProperties & {
  '--apps-stage-row-x': number;
  '--apps-stage-row-y': number;
  '--apps-stage-row-scale': number;
  '--apps-stage-row-focus': number;
  '--apps-stage-grid-x': number;
  '--apps-stage-grid-y': number;
  '--apps-stage-rank': number;
};

const round = (value: number): number => Math.round(value * 1000) / 1000;

type AppsStageDockProps = {
  apps: readonly MarketplaceApp[];
  inks: Record<string, AppsStageLogoInk>;
};

export function AppsStageDock({ apps, inks }: AppsStageDockProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef(0);

  const dockApps = apps.slice(0, MAX_DOCK_APPS);
  const count = dockApps.length;
  const restIndex = (count - 1) / 2;
  const restRow = appsStageDockLayout.row(count, null);
  const grid = appsStageDockLayout.grid(count);

  const applyFocus = (
    focusIndex: number | null,
    activeIndex: number | null,
  ) => {
    const row = appsStageDockLayout.row(count, focusIndex);

    slotRefs.current.forEach((slot, index) => {
      if (slot === null) {
        return;
      }

      slot.style.setProperty('--apps-stage-row-x', `${round(row[index].x)}`);
      slot.style.setProperty('--apps-stage-row-y', `${round(row[index].y)}`);
      slot.style.setProperty(
        '--apps-stage-row-scale',
        `${round(row[index].scale)}`,
      );
      slot.style.setProperty(
        '--apps-stage-row-focus',
        `${round(row[index].focus)}`,
      );
      slot.toggleAttribute('data-active', index === activeIndex);
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dock = dockRef.current;
    const firstSlot = slotRefs.current[0];

    if (
      event.pointerType !== 'mouse' ||
      dock === null ||
      firstSlot === null ||
      firstSlot === undefined ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const bounds = dock.getBoundingClientRect();
    const pointerX =
      (event.clientX - bounds.left - bounds.width / 2) / firstSlot.offsetWidth;

    // Read against the resting row, not the live one: the row moving under
    // the pointer must not feed back into where the focus goes.
    let focusIndex = pointerX <= restRow[0].x ? 0 : count - 1;

    for (let index = 0; index < count - 1; index++) {
      const from = restRow[index].x;
      const to = restRow[index + 1].x;

      if (pointerX >= from && pointerX <= to) {
        focusIndex = index + (pointerX - from) / (to - from);
        break;
      }
    }

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() =>
      applyFocus(focusIndex, Math.round(focusIndex)),
    );
  };

  const handlePointerLeave = () => {
    cancelAnimationFrame(frameRef.current);
    applyFocus(null, null);
  };

  const dockStyle: DockStyle = {
    '--apps-stage-row-width': round(appsStageDockLayout.rowWidth(count)),
    '--apps-stage-grid-rows': appsStageDockLayout.gridRowCount(count),
  };

  return (
    <Dock
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={dockRef}
      style={dockStyle}
    >
      {dockApps.map((app, index) => {
        const slotStyle: SlotStyle = {
          '--apps-stage-row-x': round(restRow[index].x),
          '--apps-stage-row-y': round(restRow[index].y),
          '--apps-stage-row-scale': round(restRow[index].scale),
          '--apps-stage-row-focus': round(restRow[index].focus),
          '--apps-stage-grid-x': round(grid[index].x),
          '--apps-stage-grid-y': round(grid[index].y),
          '--apps-stage-rank': Math.round(Math.abs(index - restIndex)),
        };

        return (
          <Slot
            key={app.slug}
            ref={(slot) => {
              slotRefs.current[index] = slot;
            }}
            style={slotStyle}
          >
            <Scaler>
              <Entrance>
                <TileLink
                  aria-label={app.name}
                  href={`/apps/${app.slug}`}
                  onBlur={handlePointerLeave}
                  onFocus={() => applyFocus(index, index)}
                >
                  <AppsStageLogoTile
                    hasGlow
                    ink={inks[app.slug]}
                    loading="eager"
                    logoUrl={app.logoUrl}
                    name={app.name}
                  />
                </TileLink>
              </Entrance>
            </Scaler>
            <Label aria-hidden>{app.name}</Label>
          </Slot>
        );
      })}
    </Dock>
  );
}
