'use client';

import { Accordion } from '@base-ui/react/accordion';
import { useLingui } from '@lingui/react';

import { MinusMark, PlusMark } from '@/icons';
import { styled } from '@linaria/react';

import {
  EASING,
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  spacing,
  DURATION,
} from '@/tokens';

import { type FaqQuestion } from './faq.data';

const AccordionList = styled.div`
  margin-inline: auto;
  width: 100%;

  ${mediaUp('md')} {
    width: 66%;
  }
`;

const QuestionText = styled.span`
  color: ${color('white-40')};
  font-size: ${fontSize(8)};
  font-weight: ${FONT_WEIGHT.regular};
  grid-column: 3;
  line-height: 1.25;
  min-width: 0;
  overflow-wrap: break-word;
  transition: color ${DURATION.md} ${EASING.smooth};
`;

// The question marker is two stacked rectangle states (outline resting,
// filled when hovered/open) — CSS, not SVG assets.
const MarkerLayer = styled.span`
  border-radius: 1px;
  display: block;
  height: 7px;
  left: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity ${DURATION.md} ${EASING.smooth};
  width: 14px;

  &[data-layer='outline'] {
    border: 1px solid ${color('white')};
    opacity: 1;
  }

  &[data-layer='fill'] {
    background-color: ${color('white')};
    opacity: 0;
  }
`;

// Centered on the question's first line box (32px text at 1.25 = 40px).
const MarkerContainer = styled.span`
  grid-column: 1;
  height: ${fontSize(10)};
  position: relative;
  width: 14px;
`;

const ToggleContainer = styled.span`
  grid-column: 5;
  margin-top: ${spacing(0.5)};
`;

const ToggleVisual = styled.span`
  align-items: center;
  border: 1px solid ${color('white-40')};
  border-radius: ${radius(2)};
  color: ${color('white-80')};
  display: inline-flex;
  height: 36px;
  justify-content: center;
  position: relative;
  transition:
    border-color ${DURATION.xs} ease,
    transform 0.2s ${EASING.spring};
  width: 36px;
`;

const ToggleIconLayer = styled.span`
  align-items: center;
  display: inline-flex;
  inset: 0;
  justify-content: center;
  position: absolute;
  transition:
    opacity ${DURATION.xs} ease,
    transform ${DURATION.xs} ease;

  &[data-icon='minus'] {
    opacity: 0;
    transform: scale(0.9);
  }
`;

const RowTrigger = styled.button`
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: grid;
  font: inherit;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  padding: 0;
  position: relative;
  text-align: left;
  width: 100%;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }

  &:hover [data-question] {
    color: ${color('white')};
  }

  &:hover [data-layer='outline'] {
    opacity: 0;
  }

  &:hover [data-layer='fill'] {
    opacity: 1;
  }

  &:hover [data-toggle] {
    border-color: ${color('white')};
    transform: scale(1.08);
  }

  &:active [data-toggle] {
    transform: scale(0.96);
  }
`;

const ItemRow = styled.div`
  border-top: 1px solid ${color('white-40')};
  display: grid;
  grid-template-columns: 14px 12px 1fr 32px 36px;
  padding-block: ${spacing(6)};
  row-gap: ${spacing(2)};

  &[data-open] [data-question] {
    color: ${color('white')};
  }

  &[data-open] [data-layer='outline'] {
    opacity: 0;
  }

  &[data-open] [data-layer='fill'] {
    opacity: 1;
  }

  &[data-open] [data-icon='plus'] {
    opacity: 0;
    transform: scale(0.9);
  }

  &[data-open] [data-icon='minus'] {
    opacity: 1;
    transform: scale(1);
  }

  ${mediaUp('md')} {
    grid-template-columns: 14px 60px 1fr 80px 36px;
    row-gap: ${spacing(4)};
  }
`;

const Header = styled.h3`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  position: relative;
`;

const AnswerWrapper = styled.div`
  display: grid;
  grid-column: 3;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows ${DURATION.lg} ${EASING.smooth},
    opacity ${DURATION.lg} ${EASING.smooth},
    visibility ${DURATION.lg} ${EASING.smooth};
  visibility: hidden;

  &[data-open] {
    grid-template-rows: 1fr;
    opacity: 1;
    visibility: visible;
  }
`;

const AnswerInner = styled.div`
  overflow: hidden;
`;

const AnswerText = styled.div`
  color: ${color('white')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.5;
`;

export type FaqItemsProps = {
  questions: readonly FaqQuestion[];
};

export function FaqItems({ questions }: FaqItemsProps) {
  const { i18n } = useLingui();

  return (
    <Accordion.Root render={<AccordionList />}>
      {questions.map((faqQuestion, index) => (
        <Accordion.Item
          key={faqQuestion.question.id}
          render={<ItemRow />}
          value={`faq-${index}`}
        >
          <Accordion.Header render={<Header />}>
            <Accordion.Trigger render={<RowTrigger type="button" />}>
              <MarkerContainer aria-hidden>
                <MarkerLayer data-layer="outline" />
                <MarkerLayer data-layer="fill" />
              </MarkerContainer>
              <QuestionText data-question>
                {i18n._(faqQuestion.question)}
              </QuestionText>
              <ToggleContainer aria-hidden>
                <ToggleVisual data-toggle>
                  <ToggleIconLayer data-icon="plus">
                    <PlusMark sizePx={12} />
                  </ToggleIconLayer>
                  <ToggleIconLayer data-icon="minus">
                    <MinusMark sizePx={12} />
                  </ToggleIconLayer>
                </ToggleVisual>
              </ToggleContainer>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel keepMounted render={<AnswerWrapper />}>
            <AnswerInner>
              <AnswerText>{i18n._(faqQuestion.answer)}</AnswerText>
            </AnswerInner>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
