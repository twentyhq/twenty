'use client';

import { Body, Eyebrow, Heading, IconButton } from '@/design-system/components';
import type { EyebrowType } from '@/design-system/components/Eyebrow/types/Eyebrow';
import { ArrowLeftIcon, ArrowRightIcon } from '@/icons';
import type { TestimonialCardType } from '@/sections/Testimonials/types/TestimonialCard';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type ReactNode, useState } from 'react';
import { Separator } from '../Separator/Separator';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const StyledCarousel = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
  row-gap: ${theme.spacing(6)};
  z-index: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: stretch;
    column-gap: ${theme.spacing(15)};
    grid-template-columns: auto auto minmax(0, 1fr);
    row-gap: 0;
  }
`;

const LeftColumn = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(4)};
  display: grid;
  grid-template-columns: auto 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    row-gap: ${theme.spacing(12)};
  }
`;

const CounterSlot = styled.div`
  order: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    order: 2;
  }
`;

const VisualSlot = styled.div`
  align-self: start;
  justify-self: start;
  order: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    order: 1;
  }
`;

const CounterText = styled.p`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(10)};
  font-weight: ${theme.font.weight.light};
  line-height: ${theme.lineHeight(11.5)};
  margin: 0;
  white-space: nowrap;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(12)};
    line-height: ${theme.lineHeight(14)};
    text-align: center;
  }
`;

const RightColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-width: 0;
  row-gap: ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    min-width: 0;
    padding-bottom: ${theme.spacing(8)};
    padding-top: ${theme.spacing(8)};
    row-gap: ${theme.spacing(14)};
  }
`;

const HeadingContainer = styled.div`
  display: grid;
`;

const HeadingWrapper = styled.div`
  grid-area: 1 / 1;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  transform: translateY(8px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  &[data-active='true'] {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
    transform: translateY(0);
  }
`;

const FooterRow = styled.div`
  align-items: flex-start;
  align-self: end;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    grid-template-columns: auto 1fr;
    justify-items: end;
  }
`;

const NavGroup = styled.div`
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  order: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    order: 1;
  }
`;

const AuthorBlock = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(4)};
  display: grid;
  grid-template-columns: 48px 1fr;
  order: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    order: 2;
  }
`;

const AvatarFrame = styled.div`
  border-radius: ${theme.radius(0.5)};
  height: 48px;
  overflow: hidden;
  position: relative;
  width: 48px;
`;

const AuthorMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};
`;

const NameHandleRow = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(2)};
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
`;

const HandleText = styled.span`
  border-left: 1px solid ${theme.colors.primary.border[20]};
  padding-left: ${theme.spacing(2)};
`;

type CarouselProps = {
  children: ReactNode;
  eyebrow: EyebrowType;
  testimonials: TestimonialCardType[];
};

export function Carousel({ children, eyebrow, testimonials }: CarouselProps) {
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

  return (
    <StyledCarousel
      aria-label="Testimonials"
      aria-roledescription="carousel"
      role="region"
    >
      <LeftColumn>
        <CounterSlot>
          <CounterText aria-live="polite">
            {index + 1}/{total}
          </CounterText>
        </CounterSlot>
        <VisualSlot>{children}</VisualSlot>
      </LeftColumn>

      <Separator />

      <RightColumn>
        <Eyebrow colorScheme="primary" heading={eyebrow.heading} />

        <HeadingContainer>
          {testimonials.map((t, i) => (
            <HeadingWrapper key={i} data-active={i === index}>
              <Heading as="h2" segments={t.heading} size="md" weight="light" />
            </HeadingWrapper>
          ))}
        </HeadingContainer>

        <FooterRow>
          <NavGroup>
            <IconButton
              ariaLabel="Previous testimonial"
              borderColor={
                hasPrevious
                  ? theme.colors.primary.border[20]
                  : theme.colors.primary.border[10]
              }
              icon={ArrowLeftIcon}
              iconFillColor="transparent"
              iconSize={14}
              iconStrokeColor={
                hasPrevious
                  ? theme.colors.primary.text[80]
                  : theme.colors.primary.text[20]
              }
              size={48}
              onClick={goToPrevious}
            />
            <IconButton
              ariaLabel="Next testimonial"
              borderColor={
                hasNext
                  ? theme.colors.primary.border[20]
                  : theme.colors.primary.border[10]
              }
              icon={ArrowRightIcon}
              iconFillColor="transparent"
              iconSize={14}
              iconStrokeColor={
                hasNext
                  ? theme.colors.primary.text[80]
                  : theme.colors.primary.text[20]
              }
              size={48}
              onClick={goToNext}
            />
          </NavGroup>

          <AuthorBlock>
            <AvatarFrame>
              <NextImage
                alt={current.author.avatar.alt || ''}
                fill
                sizes="48px"
                src={current.author.avatar.src}
                style={{ objectFit: 'cover' }}
              />
            </AvatarFrame>
            <AuthorMeta>
              <NameHandleRow>
                <Body
                  as="span"
                  body={current.author.name}
                  size="sm"
                  weight="medium"
                />
                <HandleText>
                  <Body as="span" body={current.author.handle} size="sm" />
                </HandleText>
              </NameHandleRow>
              <Body
                as="p"
                body={{ text: DATE_FORMATTER.format(current.author.date) }}
                size="xs"
              />
            </AuthorMeta>
          </AuthorBlock>
        </FooterRow>
      </RightColumn>
    </StyledCarousel>
  );
}
