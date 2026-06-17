'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { ArrowLeft, ArrowRight } from '@/icons';
import {
  EASING,
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Eyebrow, IconButton, MarkedDivider } from '@/ui';

import { PartnerPortrait } from './partner-portrait';
import { PartnerQuoteVisual } from './partner-quote-visual';
import { type PartnerTestimonialRecord } from './partner-testimonials.data';

const CarouselGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  row-gap: ${spacing(8)};
  z-index: 0;

  ${mediaUp('md')} {
    align-items: stretch;
    column-gap: ${spacing(15)};
    grid-template-columns: minmax(0, 328px) auto minmax(0, 1fr);
    row-gap: 0;
  }
`;

// Portrait and meta sit at the top of the column, the counter at the bottom.
const LeftColumn = styled.div`
  display: grid;
  row-gap: ${spacing(6)};

  ${mediaUp('md')} {
    align-content: space-between;
    min-height: 580px;
    row-gap: ${spacing(12)};
  }
`;

const AuthorCard = styled.div`
  display: grid;
  justify-items: start;
  row-gap: ${spacing(6)};
`;

const PortraitFrame = styled.div`
  aspect-ratio: 1;
  border-radius: ${radius(2)};
  max-width: 328px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const AuthorMeta = styled.div`
  max-width: 253px;
`;

// The name leads; the designation follows it behind a hairline, wrapping
// beneath when the row runs out of width.
const NameRow = styled.div`
  align-items: center;
  column-gap: ${spacing(2)};
  display: flex;
  flex-wrap: wrap;
`;

const designationClassName = css`
  border-left: 1px solid ${semanticColor.lineStrong};
  padding-left: ${spacing(2)};
`;

const CounterText = styled.p`
  ${typeRampDeclarations('headingMd')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.light};
  white-space: nowrap;

  ${mediaUp('md')} {
    text-align: center;
  }
`;

const SeparatorSlot = styled.div`
  /* The section draws its divider at the strong tier. */
  --marked-divider-line: ${semanticColor.lineStrong};

  width: 100%;

  ${mediaUp('md')} {
    height: 100%;
    width: auto;
  }
`;

const RightColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  min-width: 0;
  row-gap: ${spacing(8)};

  ${mediaUp('md')} {
    grid-template-rows: auto minmax(392px, 1fr) auto;
    min-height: 642px;
    row-gap: ${spacing(14)};
  }
`;

const QuoteStack = styled.div`
  display: grid;
  min-width: 0;
  position: relative;
  z-index: 1;
`;

const QuoteSlide = styled.div`
  grid-area: 1 / 1;
  max-width: 900px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
  transition:
    opacity 0.5s ${EASING.gentle},
    transform 0.5s ${EASING.gentle};
  visibility: hidden;

  &[data-active] {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    visibility: visible;
  }
`;

// Testimonials are quotes, not section titles — rendered as a paragraph that
// borrows the headingMd display ramp rather than carrying a heading tag.
const QuoteText = styled.p`
  ${typeRampDeclarations('headingMd')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.light};
  text-wrap: balance;
`;

const QuoteArea = styled.div`
  isolation: isolate;
  min-width: 0;
  position: relative;

  ${mediaUp('md')} {
    min-height: 392px;
  }
`;

// The quote-mark sits behind the text (desktop only): a fixed 646x544 window,
// top-right, that clips the upscaled GLB.
const QuoteDecoration = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: block;
    height: 544px;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 56px;
    width: 646px;
    z-index: 0;
  }
`;

const QuoteDecorationVisual = styled.div`
  ${mediaUp('md')} {
    position: absolute;
    right: 0;
    top: -112px;
    transform: scale(1.9);
    transform-origin: top right;
  }
`;

const FooterRow = styled.div`
  align-self: end;
`;

const NavGroup = styled.div`
  column-gap: ${spacing(2)};
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
`;

export function PartnerTestimonialsCarousel({
  testimonials,
}: {
  testimonials: readonly PartnerTestimonialRecord[];
}) {
  const { i18n } = useLingui();
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const hasPrevious = index > 0;
  const hasNext = index < total - 1;
  const current = testimonials[index];
  const authorName = i18n._(current.author.name);

  return (
    <CarouselGrid
      aria-label={i18n._(msg`Partner testimonials`)}
      aria-roledescription={i18n._(msg`carousel`)}
      role="region"
    >
      <LeftColumn>
        <AuthorCard>
          <PortraitFrame>
            <PartnerPortrait
              alt={i18n._(msg`Portrait of ${authorName}`)}
              src={current.author.portraitSrc}
            />
          </PortraitFrame>
          <AuthorMeta>
            <NameRow>
              <Body as="span" size="sm" weight="medium">
                {authorName}
              </Body>
              <span className={designationClassName}>
                <Body as="span" muted size="sm">
                  {i18n._(current.author.designation)}
                </Body>
              </span>
            </NameRow>
          </AuthorMeta>
        </AuthorCard>
        <CounterText aria-live="polite">
          {index + 1}/{total}
        </CounterText>
      </LeftColumn>

      <SeparatorSlot>
        <MarkedDivider />
      </SeparatorSlot>

      <RightColumn>
        <Eyebrow>{i18n._(msg`Join our growing partner ecosystem`)}</Eyebrow>
        <QuoteArea>
          <QuoteStack>
            {testimonials.map((testimonial, testimonialIndex) => (
              <QuoteSlide
                data-active={testimonialIndex === index ? '' : undefined}
                key={testimonial.author.name.id}
              >
                <QuoteText>{i18n._(testimonial.quote)}</QuoteText>
              </QuoteSlide>
            ))}
          </QuoteStack>
          <QuoteDecoration aria-hidden>
            <QuoteDecorationVisual>
              <PartnerQuoteVisual />
            </QuoteDecorationVisual>
          </QuoteDecoration>
        </QuoteArea>
        <FooterRow>
          <NavGroup>
            <IconButton
              ariaLabel={i18n._(msg`Previous testimonial`)}
              disabled={!hasPrevious}
              onClick={() => hasPrevious && setIndex(index - 1)}
              sizePx={48}
            >
              <ArrowLeft sizePx={14} />
            </IconButton>
            <IconButton
              ariaLabel={i18n._(msg`Next testimonial`)}
              disabled={!hasNext}
              onClick={() => hasNext && setIndex(index + 1)}
              sizePx={48}
            >
              <ArrowRight sizePx={14} />
            </IconButton>
          </NavGroup>
        </FooterRow>
      </RightColumn>
    </CarouselGrid>
  );
}
