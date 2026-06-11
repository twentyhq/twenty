import { styled } from '@linaria/react';

import { ArrowRight } from '@/icons';
import { msg } from '@lingui/core/macro';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  color,
  EASING,
  fontFamily,
  FONT_WEIGHT,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body } from '@/ui';
import { ButtonShape } from '@/ui/button-shape';

import { CardShape } from './card-shape';
import { type IllustrationCardRecord } from './three-cards.data';

const ACTION_SIZE_PX = 40;

const CardContainer = styled.div`
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  height: 100%;
  isolation: isolate;
  min-height: 0;
  min-width: 0;
  padding: ${spacing(4)};
  position: relative;
`;

const CardHeading = styled.h3`
  ${typeRampDeclarations('headingXs')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
  margin: 0;
`;

const CardRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  height: 0;
  width: 100%;
`;

// The visual stage: the halftone illustration (diamond/flash/lock) renders
// here when the visual-runtime port lands.
const CardStage = styled.div`
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  height: 240px;
  overflow: hidden;
  width: 100%;
`;

const CardLower = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing(4)};
  min-width: 0;
`;

const CardFooter = styled.footer`
  align-items: center;
  column-gap: ${spacing(2)};
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  margin-top: auto;
`;

const AttributionPipe = styled.span`
  border-left: 1px solid ${semanticColor.divider};
  display: block;
  height: 21px;
  width: 0;
`;

const TrailingAction = styled.div`
  justify-self: end;
`;

// Square shaped icon link, on the button system's physics: opaque ink shape
// in the hover layer, opacity on the layer, never on the fill.
const ActionLink = styled(LocalizedLink)`
  --button-fill: transparent;
  --button-stroke: ${color('black-20')};

  align-items: center;
  color: ${color('black-80')};
  display: inline-flex;
  flex-shrink: 0;
  height: ${ACTION_SIZE_PX}px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  transition:
    color 0.2s ease,
    transform 0.2s ${EASING.spring};
  width: ${ACTION_SIZE_PX}px;

  &:is(:hover, :focus-visible) {
    color: ${color('black')};
  }

  &:is(:hover, :focus-visible) [data-slot='action-hover'] > span {
    transform: translateX(0);
  }

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }

  [data-slot='action-hover'] {
    --button-fill: ${color('black')};
    --button-stroke: transparent;

    inset: 0;
    opacity: 0.05;
    overflow: hidden;
    pointer-events: none;
    position: absolute;

    > span {
      display: block;
      height: 100%;
      transform: translateX(calc(-100% - ${spacing(4)}));
      transition: transform 260ms ${EASING.standard};
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [data-slot='action-hover'] > span {
      transition: none;
    }
  }

  [data-slot='action-glyph'] {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    position: relative;
  }
`;

export function IllustrationCard({ card }: { card: IllustrationCardRecord }) {
  const i18n = getServerI18n();

  return (
    <CardContainer>
      <CardShape />
      <CardHeading>{i18n._(card.heading)}</CardHeading>
      <CardRule aria-hidden />
      <CardStage data-illustration={card.illustration} />
      <CardRule aria-hidden />
      <CardLower>
        <Body size="sm">{i18n._(card.body)}</Body>
        <CardFooter>
          <Body size="xs" weight="medium">
            {i18n._(card.attribution.role)}
          </Body>
          <AttributionPipe aria-hidden />
          <Body size="xs">{i18n._(card.attribution.company)}</Body>
          <TrailingAction>
            <ActionLink
              aria-label={i18n._(
                msg`${i18n._(card.attribution.company)} case study`,
              )}
              href={`/customers/${card.caseStudySlug}`}
            >
              <ButtonShape heightPx={ACTION_SIZE_PX} outlined />
              <span data-slot="action-hover">
                <span>
                  <ButtonShape heightPx={ACTION_SIZE_PX} />
                </span>
              </span>
              <span data-slot="action-glyph">
                <ArrowRight sizePx={18} />
              </span>
            </ActionLink>
          </TrailingAction>
        </CardFooter>
      </CardLower>
    </CardContainer>
  );
}
