'use client';

import { Body, Eyebrow, Heading, IconButton } from '@/design-system/components';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { ArrowLeftIcon, ArrowRightIcon } from '@/icons';
import type { TestimonialCardType } from '@/sections/Testimonials/types/TestimonialCard';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type ReactNode, useState } from 'react';
import { Separator } from '../Separator/Separator';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const nameTextClassName = css`
  color: ${theme.colors.secondary.text[100]};
`;

const handleTextClassName = css`
  color: ${theme.colors.secondary.text[100]};
`;

const dateTextClassName = css`
  color: ${theme.colors.secondary.text[80]};
`;

const quoteHeadingClassName = css`
  color: ${theme.colors.secondary.text[100]};
  position: relative;
  z-index: 1;
`;

const StyledCarousel = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  position: relative;
  row-gap: ${theme.spacing(8)};
  z-index: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: stretch;
    column-gap: ${theme.spacing(15)};
    grid-template-columns: minmax(0, 328px) auto minmax(0, 1fr);
    row-gap: 0;
  }
`;

const LeftColumn = styled.div`
  display: grid;
  row-gap: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    align-content: space-between;
    min-height: 580px;
    row-gap: ${theme.spacing(12)};
  }
`;

const AuthorCard = styled.div`
  display: grid;
  justify-items: start;
  row-gap: ${theme.spacing(6)};
`;

const PortraitFrame = styled.div`
  aspect-ratio: 1;
  border-radius: ${theme.radius(2)};
  max-width: 328px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const PortraitPlaceholder = styled.div`
  align-items: center;
  background-color: ${theme.colors.secondary.border[10]};
  color: ${theme.colors.secondary.text[60]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(12)};
  font-weight: ${theme.font.weight.medium};
  height: 100%;
  justify-content: center;
  letter-spacing: -0.02em;
  width: 100%;
`;

const AuthorMeta = styled.div`
  display: grid;
  max-width: 253px;
  row-gap: ${theme.spacing(2)};
`;

const NameHandleRow = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(2)};
  display: flex;
  flex-wrap: wrap;
`;

const HandleText = styled.div`
  border-left: 1px solid ${theme.colors.secondary.border[100]};
  line-height: 0;
  padding-left: ${theme.spacing(2)};
`;

const CounterText = styled.p`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(10)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.04em;
  line-height: ${theme.lineHeight(11.5)};
  margin: 0;
  text-align: start;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(12)};
    line-height: ${theme.lineHeight(14)};
    text-align: center;
  }
`;

const RightColumn = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto auto;
  min-width: 0;
  position: relative;
  row-gap: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-rows: auto minmax(392px, 1fr) auto;
    min-height: 642px;
    row-gap: ${theme.spacing(14)};
  }
`;

const QuoteArea = styled.div`
  isolation: isolate;
  min-width: 0;
  position: relative;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 392px;
  }
`;

const QuoteStack = styled.div`
  display: grid;
  min-width: 0;
  position: relative;
  z-index: 1;
`;

const QuoteWrapper = styled.div`
  grid-area: 1 / 1;
  max-width: 900px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden;

  &[data-active='true'] {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
    visibility: visible;
  }
`;

const QuoteDecoration = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
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
  @media (min-width: ${theme.breakpoints.md}px) {
    position: absolute;
    right: 0;
    top: -112px;
    transform: scale(1.9);
    transform-origin: top right;
  }
`;

const FooterRow = styled.div`
  position: relative;
  z-index: 1;
`;

const NavGroup = styled.div`
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
`;

type PartnerCarouselProps = {
  children?: ReactNode;
  eyebrow: EyebrowType;
  testimonials: TestimonialCardType[];
};

export function PartnerCarousel({
  children,
  eyebrow,
  testimonials,
}: PartnerCarouselProps) {
  const [index, setIndex] = useState(0);

  const total = testimonials.length;
  if (total === 0) return null;

  const hasPrevious = index > 0;
  const hasNext = index < total - 1;
  const current = testimonials[index];

  const goToPrevious = () => {
    if (hasPrevious) setIndex(index - 1);
  };

  const goToNext = () => {
    if (hasNext) setIndex(index + 1);
  };

  const avatar = current.author.avatar;
  const authorInitials = current.author.name.text
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <StyledCarousel
      aria-label="Partner testimonials"
      aria-roledescription="carousel"
      role="region"
    >
      <LeftColumn>
        <AuthorCard>
          <PortraitFrame>
            {avatar ? (
              <NextImage
                alt={avatar.alt ?? ''}
                fill
                priority
                sizes="(min-width: 921px) 328px, 100vw"
                src={avatar.src}
                style={{
                  filter: 'grayscale(1) contrast(1.1)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <PortraitPlaceholder aria-hidden>
                {authorInitials}
              </PortraitPlaceholder>
            )}
          </PortraitFrame>

          <AuthorMeta>
            <NameHandleRow>
              <Body
                as="span"
                body={current.author.name}
                className={nameTextClassName}
                size="sm"
                weight="medium"
              />
              <HandleText>
                <Body
                  as="span"
                  body={current.author.designation}
                  className={handleTextClassName}
                  size="sm"
                />
              </HandleText>
            </NameHandleRow>

            {current.author.date ? (
              <Body
                as="p"
                body={{
                  text: DATE_FORMATTER.format(current.author.date),
                }}
                className={dateTextClassName}
                size="xs"
              />
            ) : null}
          </AuthorMeta>
        </AuthorCard>

        <CounterText aria-live="polite">
          {index + 1}/{total}
        </CounterText>
      </LeftColumn>

      <Separator colorScheme="secondary" />

      <RightColumn>
        <Eyebrow colorScheme="secondary" heading={eyebrow.heading} />

        <QuoteArea>
          <QuoteStack>
            {testimonials.map((testimonial, testimonialIndex) => (
              <QuoteWrapper
                key={testimonialIndex}
                data-active={testimonialIndex === index}
              >
                <Heading
                  as="h2"
                  className={quoteHeadingClassName}
                  segments={testimonial.heading}
                  size="md"
                  weight="light"
                />
              </QuoteWrapper>
            ))}
          </QuoteStack>

          {children ? (
            <QuoteDecoration>
              <QuoteDecorationVisual>{children}</QuoteDecorationVisual>
            </QuoteDecoration>
          ) : null}
        </QuoteArea>

        <FooterRow>
          <NavGroup>
            <IconButton
              ariaLabel="Previous testimonial"
              borderColor={
                hasPrevious
                  ? theme.colors.secondary.border[20]
                  : theme.colors.secondary.border[10]
              }
              icon={ArrowLeftIcon}
              iconFillColor="transparent"
              iconSize={14}
              iconStrokeColor={
                hasPrevious
                  ? theme.colors.secondary.text[80]
                  : theme.colors.secondary.text[20]
              }
              size={48}
              onClick={goToPrevious}
            />
            <IconButton
              ariaLabel="Next testimonial"
              borderColor={
                hasNext
                  ? theme.colors.secondary.border[20]
                  : theme.colors.secondary.border[10]
              }
              icon={ArrowRightIcon}
              iconFillColor="transparent"
              iconSize={14}
              iconStrokeColor={
                hasNext
                  ? theme.colors.secondary.text[80]
                  : theme.colors.secondary.text[20]
              }
              size={48}
              onClick={goToNext}
            />
          </NavGroup>
        </FooterRow>
      </RightColumn>
    </StyledCarousel>
  );
}
