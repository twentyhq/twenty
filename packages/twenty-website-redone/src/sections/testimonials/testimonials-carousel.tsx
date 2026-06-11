'use client';

import { msg } from '@lingui/core/macro';

import { ArrowLeft, ArrowRight } from '@/icons';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  EASING,
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Eyebrow, Heading, IconButton, MarkedDivider } from '@/ui';

import { type TestimonialRecord } from './testimonials.data';

const CarouselGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  row-gap: ${spacing(6)};
  z-index: 0;

  ${mediaUp('md')} {
    align-items: stretch;
    column-gap: ${spacing(15)};
    grid-template-columns: auto auto minmax(0, 1fr);
    row-gap: 0;
  }
`;

const LeftColumn = styled.div`
  align-items: center;
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: auto 1fr;

  ${mediaUp('md')} {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    row-gap: ${spacing(12)};
  }
`;

const CounterSlot = styled.div`
  order: 1;

  ${mediaUp('md')} {
    order: 2;
  }
`;

// The hourglass halftone renders here with the visual-runtime wave; the
// slot reserves the authored canvas box now so the load cannot shift
// layout (198x279 stacked, 336x476 from md).
const VisualSlot = styled.div`
  align-self: start;
  justify-self: start;
  min-height: 279px;
  min-width: 198px;
  order: 2;

  ${mediaUp('md')} {
    min-height: 476px;
    min-width: 336px;
    order: 1;
  }
`;

const CounterText = styled.p`
  ${typeRampDeclarations('headingMd')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.light};
  margin: 0;
  white-space: nowrap;

  ${mediaUp('md')} {
    text-align: center;
  }
`;

const RightColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-width: 0;
  row-gap: ${spacing(6)};

  ${mediaUp('md')} {
    padding-block: ${spacing(8)};
    row-gap: ${spacing(14)};
  }
`;

const QuoteStack = styled.div`
  display: grid;
`;

const QuoteSlide = styled.div`
  grid-area: 1 / 1;
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

const FooterRow = styled.div`
  align-items: flex-start;
  align-self: end;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(4)};

  ${mediaUp('md')} {
    align-items: center;
    grid-template-columns: auto 1fr;
  }
`;

const NavGroup = styled.div`
  column-gap: ${spacing(2)};
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  order: 2;

  ${mediaUp('md')} {
    order: 1;
  }
`;

const AuthorBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: start;
  order: 1;
  row-gap: ${spacing(1)};
  text-align: left;

  ${mediaUp('md')} {
    justify-self: end;
    order: 2;
  }
`;

const SeparatorSlot = styled.div`
  /* This divider reads structural: the old section draws it at the strong
     tier (0.2), unlike the footer's 0.1. */
  --marked-divider-line: ${semanticColor.lineStrong};

  width: 100%;

  ${mediaUp('md')} {
    height: 100%;
    width: auto;
  }
`;

export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: readonly TestimonialRecord[];
}) {
  const { i18n } = useLingui();
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const hasPrevious = index > 0;
  const hasNext = index < total - 1;
  const current = testimonials[index];

  return (
    <CarouselGrid
      aria-label={i18n._(msg`Testimonials`)}
      aria-roledescription="carousel"
      role="region"
    >
      <LeftColumn>
        <CounterSlot>
          <CounterText aria-live="polite">
            {index + 1}/{total}
          </CounterText>
        </CounterSlot>
        <VisualSlot data-illustration="hourglass" />
      </LeftColumn>
      <SeparatorSlot>
        <MarkedDivider />
      </SeparatorSlot>
      <RightColumn>
        <Eyebrow>{i18n._(msg`They are the real sales`)}</Eyebrow>
        <QuoteStack>
          {testimonials.map((testimonial, testimonialIndex) => (
            <QuoteSlide
              data-active={testimonialIndex === index ? '' : undefined}
              key={testimonial.author.name.id}
            >
              <Heading as="h2" size="md" weight="light">
                {i18n._(testimonial.quote)}
              </Heading>
            </QuoteSlide>
          ))}
        </QuoteStack>
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
          <AuthorBlock>
            <Body size="sm" weight="medium">
              {i18n._(current.author.name)}
            </Body>
            <Body muted size="xs">
              {i18n._(current.author.designation)}
            </Body>
          </AuthorBlock>
        </FooterRow>
      </RightColumn>
    </CarouselGrid>
  );
}
