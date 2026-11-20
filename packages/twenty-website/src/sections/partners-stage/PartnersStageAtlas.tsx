'use client';

import { msg, plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode, useEffect, useState } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { usePrefersReducedMotion } from '@/platform/motion';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { type PartnersStageAtlasPartner } from './partners-stage-atlas-partner.type';
import { PartnersStageMark } from './PartnersStageMark';

const SPOTLIGHT_DWELL_MS = 2800;
const RAIL_LIMIT = 24;
// The callout and the cycle wait for the map scan and the dots to land.
const INTRO_MS = 1900;
const FLIP_CALLOUT_AFTER_PERCENT = 64;

const AtlasRoot = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const MapBox = styled.div`
  position: relative;
`;

// Dots and callout are placed in percentages of this box, so it holds the
// drawing and nothing else.
const MapCanvas = styled.div`
  position: relative;

  @keyframes partnersStageMapScan {
    from {
      clip-path: inset(0 100% 0 0);
      opacity: 0.2;
    }
    to {
      clip-path: inset(0 0 0 0);
      opacity: 1;
    }
  }

  & > svg {
    animation: partnersStageMapScan 1800ms ${EASING.smooth} both;
  }

  ${REDUCED_MOTION} {
    & > svg {
      animation: none;
    }
  }
`;

const CityDot = styled.span`
  @keyframes partnersStageCityEnter {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes partnersStageCityPing {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(5);
    }
  }

  animation: partnersStageCityEnter ${DURATION.xl} ${EASING.spring} both;
  animation-delay: calc(900ms + var(--partners-stage-index) * 45ms);
  background-color: ${color('white-60')};
  border-radius: 50%;
  box-shadow:
    0 0 0 2px ${color('white-10')},
    0 0 10px 2px ${color('white-20')};
  height: 4px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, -50%);
  transition:
    background-color ${DURATION.md} ${EASING.gentle},
    box-shadow ${DURATION.md} ${EASING.gentle};
  width: 4px;

  ${mediaUp('md')} {
    box-shadow:
      0 0 0 3px ${color('white-10')},
      0 0 18px 4px ${color('white-20')};
    height: 6px;
    width: 6px;
  }

  &::after {
    border: 1px solid ${color('green')};
    border-radius: 50%;
    content: '';
    inset: -2px;
    opacity: 0;
    position: absolute;
  }

  &[data-active] {
    background-color: ${color('green')};
    box-shadow:
      0 0 0 3px ${color('green')},
      0 0 24px 8px ${color('green')};
    z-index: 1;
  }

  ${mediaUp('md')} {
    &[data-active] {
      box-shadow:
        0 0 0 4px ${color('green')},
        0 0 36px 12px ${color('green')};
    }
  }

  &[data-active]::after {
    animation: partnersStageCityPing 1600ms ${EASING.gentle} infinite;
  }

  ${REDUCED_MOTION} {
    animation: none;

    &[data-active]::after {
      animation: none;
    }
  }
`;

const Callout = styled.div`
  @keyframes partnersStageCalloutEnter {
    from {
      opacity: 0;
      transform: translate3d(var(--partners-stage-callout-from), -50%, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, -50%, 0);
    }
  }

  align-items: center;
  animation: partnersStageCalloutEnter ${DURATION.lg} ${EASING.standard} both;
  backdrop-filter: blur(10px);
  background-color: ${color('black-80')};
  border: 1px solid ${color('white-10')};
  border-radius: ${radius(2)};
  box-shadow: inset 0 1px 0 ${color('white-10')};
  display: none;
  gap: ${spacing(3)};
  padding: ${spacing(2)} ${spacing(4)} ${spacing(2)} ${spacing(2)};
  pointer-events: none;
  position: absolute;
  transform: translate3d(0, -50%, 0);
  white-space: nowrap;
  z-index: 2;

  --partners-stage-callout-from: -8px;

  &[data-side='left'] {
    --partners-stage-callout-from: 8px;
  }

  ${mediaUp('sm')} {
    display: flex;
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const CalloutText = styled.span`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const CalloutName = styled.span`
  color: ${color('white')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.2;
`;

const MonoLine = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
`;

// Bleeds to the screen edge on phones so the row scrolls under the gutter.
const Rail = styled.ul`
  display: flex;
  gap: ${spacing(2)};
  list-style: none;
  margin-inline: calc(${spacing(4)} * -1);
  overflow-x: auto;
  padding: ${spacing(1.5)} ${spacing(4)} ${spacing(2)};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${mediaUp('md')} {
    flex-wrap: wrap;
    margin-inline: 0;
    overflow: visible;
    padding-inline: 0;
  }
`;

const RailItem = styled.li`
  @keyframes partnersStageRailEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 14px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: partnersStageRailEnter 700ms ${EASING.standard} both;
  animation-delay: calc(500ms + var(--partners-stage-index) * 40ms);
  flex-shrink: 0;

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const RailLink = styled(LocalizedLink)`
  @keyframes partnersStageDwell {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  background-color: ${color('white-5')};
  border: 1px solid ${color('white-10')};
  border-radius: ${radius(2)};
  box-shadow: inset 0 1px 0 ${color('white-10')};
  display: block;
  opacity: 0.45;
  padding: ${spacing(1.25)};
  position: relative;
  transition:
    opacity ${DURATION.md} ${EASING.gentle},
    transform ${DURATION.md} ${EASING.standard},
    border-color ${DURATION.md} ${EASING.gentle},
    background-color ${DURATION.xxs} ${EASING.gentle};

  &::after {
    background-color: ${color('green')};
    bottom: calc(${spacing(1.5)} * -1);
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    transform: scaleX(0);
    transform-origin: left;
  }

  &:hover,
  &[data-active] {
    background-color: ${color('white-10')};
    border-color: ${color('white-40')};
    opacity: 1;
    transform: translate3d(0, -4px, 0);
  }

  &[data-active][data-cycling]::after {
    animation: partnersStageDwell var(--partners-stage-dwell) linear both;
  }

  &:focus-visible {
    opacity: 1;
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;

    &:hover,
    &[data-active] {
      transform: none;
    }

    &[data-active][data-cycling]::after {
      animation: none;
    }
  }
`;

const RailBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(6)};
  justify-content: space-between;
`;

// Sits in the map's empty south-east Pacific corner on wide screens.
const MapCaption = styled.div`
  margin-top: ${spacing(4)};

  ${mediaUp('md')} {
    bottom: ${spacing(2)};
    left: 0;
    margin-top: 0;
    max-width: 260px;
    position: absolute;
  }
`;

type PartnersStageAtlasProps = {
  map: ReactNode;
  partners: readonly PartnersStageAtlasPartner[];
};

// PROTOTYPE
// The hero's object: the directory drawn on the world. One partner is in the
// light at a time; the rail of marks is both the index and the scrubber.
export function PartnersStageAtlas({ map, partners }: PartnersStageAtlasProps) {
  const { i18n } = useLingui();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHeld, setIsHeld] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasLanded(true), INTRO_MS);

    return () => window.clearTimeout(timer);
  }, []);

  const isIntroDone = hasLanded || prefersReducedMotion || isHeld;

  const railPartners = partners.slice(0, RAIL_LIMIT);
  const railCount = railPartners.length;
  const isCycling =
    isIntroDone && !isHeld && !prefersReducedMotion && railCount > 1;

  useEffect(() => {
    if (!isCycling) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % railCount);
    }, SPOTLIGHT_DWELL_MS);

    return () => window.clearInterval(timer);
  }, [isCycling, railCount]);

  const activePartner = railPartners[activeIndex];
  const activePlace = activePartner?.place ?? null;
  const calloutSide =
    activePlace !== null && activePlace.leftPercent > FLIP_CALLOUT_AFTER_PERCENT
      ? 'left'
      : 'right';

  const holdOn = (index: number) => {
    setActiveIndex(index);
    setIsHeld(true);
  };

  const partnerCount = partners.length;

  return (
    <AtlasRoot>
      <MapBox>
        <MapCanvas>
          {map}
          {railPartners.map((partner, index) =>
            partner.place === null ? null : (
              <CityDot
                aria-hidden
                data-active={
                  isIntroDone && index === activeIndex ? '' : undefined
                }
                key={partner.slug}
                style={{
                  ['--partners-stage-index' as string]: index,
                  left: `${partner.place.leftPercent}%`,
                  top: `${partner.place.topPercent}%`,
                }}
              />
            ),
          )}
          {isIntroDone &&
            activePartner !== undefined &&
            activePlace !== null && (
              <Callout
                aria-hidden
                data-side={calloutSide}
                key={activePartner.slug}
                style={
                  calloutSide === 'right'
                    ? {
                        left: `calc(${activePlace.leftPercent}% + 20px)`,
                        top: `${activePlace.topPercent}%`,
                      }
                    : {
                        right: `calc(${100 - activePlace.leftPercent}% + 20px)`,
                        top: `${activePlace.topPercent}%`,
                      }
                }
              >
                <PartnersStageMark
                  markUrl={activePartner.markUrl}
                  name={activePartner.name}
                  sizePx={40}
                  tone="dark"
                />
                <CalloutText>
                  <CalloutName>{activePartner.name}</CalloutName>
                  {activePartner.locationLine.length > 0 && (
                    <MonoLine>{activePartner.locationLine}</MonoLine>
                  )}
                </CalloutText>
              </Callout>
            )}
        </MapCanvas>
        {partnerCount > 0 && (
          <MapCaption>
            <MonoLine>
              {i18n._(
                msg`${plural(partnerCount, {
                  one: '# certified partner ready to take on your project',
                  other: '# certified partners ready to take on your project',
                })}`,
              )}
            </MonoLine>
          </MapCaption>
        )}
      </MapBox>
      <RailBar>
        {railCount > 0 && (
          <Rail
            onBlur={() => setIsHeld(false)}
            onMouseLeave={() => setIsHeld(false)}
          >
            {railPartners.map((partner, index) => (
              <RailItem
                key={partner.slug}
                style={{ ['--partners-stage-index' as string]: index }}
              >
                <RailLink
                  aria-label={partner.name}
                  data-active={index === activeIndex ? '' : undefined}
                  data-cycling={isCycling ? '' : undefined}
                  href={`/partners/profile/${partner.slug}`}
                  onFocus={() => holdOn(index)}
                  onMouseEnter={() => holdOn(index)}
                  style={{
                    ['--partners-stage-dwell' as string]: `${SPOTLIGHT_DWELL_MS}ms`,
                  }}
                >
                  <PartnersStageMark
                    markUrl={partner.markUrl}
                    name={partner.name}
                    sizePx={36}
                    tone="dark"
                  />
                </RailLink>
              </RailItem>
            ))}
          </Rail>
        )}
      </RailBar>
    </AtlasRoot>
  );
}
