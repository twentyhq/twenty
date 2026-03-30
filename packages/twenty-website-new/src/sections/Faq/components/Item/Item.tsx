'use client';

import {
  Accordion as BaseAccordion,
  type AccordionTriggerState,
} from '@base-ui/react/accordion';
import {
  MinusIcon,
  PlusIcon,
  RectangleFillIcon,
  RectangleOutlineIcon,
} from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconButton } from '@/design-system/components';
import type { FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';

const QuestionText = styled.span`
  color: ${theme.colors.secondary.text[40]};
  font-size: 2rem;
  font-weight: ${theme.font.weight.regular};
  grid-column: 3;
  line-height: 1.25;
  min-width: 0;
  overflow-wrap: break-word;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const QuestionIconLayer = styled.span`
  bottom: 0;
  display: block;
  left: 0;
  position: absolute;
  right: 0;
  top: 7px;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &[data-layer='outline'] {
    opacity: 1;
  }

  &[data-layer='fill'] {
    opacity: 0;
  }
`;

const ToggleContainer = styled.div`
  grid-column: 5;
  margin-top: ${theme.spacing(0.5)};

  button::after {
    bottom: 0;
    content: '';
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

export const ItemRow = styled.div`
  border-top: 1px solid ${theme.colors.secondary.text[40]};
  display: grid;
  grid-template-columns: 14px 12px 1fr 32px 36px;
  padding-bottom: ${theme.spacing(6)};
  padding-top: ${theme.spacing(6)};
  row-gap: ${theme.spacing(2)};

  &[data-open] ${QuestionText} {
    color: ${theme.colors.secondary.text[100]};
  }

  &[data-open] ${QuestionIconLayer}[data-layer='outline'] {
    opacity: 0;
  }

  &[data-open] ${QuestionIconLayer}[data-layer='fill'] {
    opacity: 1;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: 14px 60px 1fr 80px 36px;
    row-gap: ${theme.spacing(4)};
  }
`;

const Header = styled.h3`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  position: relative;

  &:hover ${QuestionText} {
    color: #ffffff;
  }

  &:hover ${QuestionIconLayer}[data-layer='outline'] {
    opacity: 0;
  }

  &:hover ${QuestionIconLayer}[data-layer='fill'] {
    opacity: 1;
  }

  &:hover ${ToggleContainer} button {
    border-color: ${theme.colors.secondary.text[100]};
  }
`;

const QuestionIconContainer = styled.span`
  grid-column: 1;
  height: 12px;
  position: relative;
  width: 12px;
`;

const AnswerWrapper = styled.div`
  display: grid;
  grid-column: 3;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: 1.5;
  margin: 0;
`;

type ItemProps = {
  question: FaqQuestionType;
  value: string;
};

export function Item({ question, value }: ItemProps) {
  return (
    <BaseAccordion.Item key={value} value={value} render={<ItemRow />}>
      <BaseAccordion.Header render={<Header />}>
        <QuestionIconContainer aria-hidden>
          <QuestionIconLayer data-layer="outline">
            <RectangleOutlineIcon
              size={14}
              strokeColor={theme.colors.secondary.text[100]}
            />
          </QuestionIconLayer>
          <QuestionIconLayer data-layer="fill">
            <RectangleFillIcon
              size={14}
              fillColor={theme.colors.secondary.text[100]}
            />
          </QuestionIconLayer>
        </QuestionIconContainer>

        <QuestionText>{question.question.text}</QuestionText>

        <ToggleContainer>
          <BaseAccordion.Trigger
            render={(props, state: AccordionTriggerState) => {
              const isOpen = state.open;
              return (
                <IconButton
                  icon={isOpen ? MinusIcon : PlusIcon}
                  ariaLabel={isOpen ? 'Collapse' : 'Expand'}
                  borderColor={theme.colors.secondary.border[40]}
                  iconFillColor="none"
                  iconSize={12}
                  iconStrokeColor={theme.colors.secondary.border[80]}
                  size={36}
                  onClick={props.onClick}
                  ariaExpanded={isOpen}
                />
              );
            }}
          />
        </ToggleContainer>
      </BaseAccordion.Header>

      <BaseAccordion.Panel render={<AnswerWrapper />} keepMounted>
        <AnswerInner>
          <AnswerText>{question.answer.text}</AnswerText>
        </AnswerInner>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}
