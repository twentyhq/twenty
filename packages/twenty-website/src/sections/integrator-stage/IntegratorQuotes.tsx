'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { ArrowLeft, ArrowRight } from '@/icons';
import {
  EASING,
  FONT_WEIGHT,
  fontFamily,
  REDUCED_MOTION,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Eyebrow, IconButton, SectionShell } from '@/ui';

type IntegratorQuote = {
  quote: MessageDescriptor;
  author: { name: MessageDescriptor; designation: MessageDescriptor };
};

const Block = styled.div`
  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const QuoteStack = styled.div`
  display: grid;
  max-width: 960px;
`;

const QuoteSlide = styled.p`
  ${typeRampDeclarations('headingMd')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.light};
  grid-area: 1 / 1;
  opacity: 0;
  text-wrap: balance;
  transform: translateY(8px);
  transition:
    opacity 0.5s ${EASING.gentle},
    transform 0.5s ${EASING.gentle};
  visibility: hidden;

  &[data-active] {
    opacity: 1;
    transform: none;
    visibility: visible;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const FooterRow = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)} ${spacing(4)};
  padding-top: ${spacing(5)};
`;

const Author = styled.p`
  flex: 1 1 auto;
  min-width: 0;
`;

const Controls = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
`;

const Counter = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  margin-right: ${spacing(2)};
`;

type IntegratorQuotesProps = {
  quotes: readonly IntegratorQuote[];
};

// PROTOTYPE direction d: one quiet block, quote first, everything else on one line.
export function IntegratorQuotes({ quotes }: IntegratorQuotesProps) {
  const { i18n } = useLingui();
  const [index, setIndex] = useState(0);
  const total = quotes.length;
  const current = quotes[index];

  return (
    <SectionShell scheme="dark">
      <Block
        aria-label={i18n._(msg`Partner testimonials`)}
        aria-roledescription={i18n._(msg`carousel`)}
        role="region"
      >
        <Eyebrow>{i18n._(msg`Join our growing partner ecosystem`)}</Eyebrow>
        <QuoteStack>
          {quotes.map((quote, quoteIndex) => (
            <QuoteSlide
              aria-hidden={quoteIndex !== index}
              data-active={quoteIndex === index ? '' : undefined}
              key={quote.author.name.id}
            >
              {i18n._(quote.quote)}
            </QuoteSlide>
          ))}
        </QuoteStack>
        <FooterRow>
          <Author>
            <Body as="span" size="sm" weight="medium">
              {i18n._(current.author.name)}
            </Body>{' '}
            <Body as="span" muted size="sm">
              {i18n._(current.author.designation)}
            </Body>
          </Author>
          <Controls>
            <Counter aria-live="polite">
              {index + 1}/{total}
            </Counter>
            <IconButton
              ariaLabel={i18n._(msg`Previous testimonial`)}
              disabled={index === 0}
              onClick={() => setIndex(Math.max(0, index - 1))}
            >
              <ArrowLeft sizePx={14} />
            </IconButton>
            <IconButton
              ariaLabel={i18n._(msg`Next testimonial`)}
              disabled={index === total - 1}
              onClick={() => setIndex(Math.min(total - 1, index + 1))}
            >
              <ArrowRight sizePx={14} />
            </IconButton>
          </Controls>
        </FooterRow>
      </Block>
    </SectionShell>
  );
}
