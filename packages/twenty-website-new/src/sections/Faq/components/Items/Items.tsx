'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { FaqQuestionType } from '@/sections/Faq/types/FaqQuestion';
import { Item } from '../Item/Item';

type ItemsProps = {
  questions: FaqQuestionType[];
};

const AccordionList = styled.div`
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  margin-top: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    width: 66%;
  }
`;

export function Items({ questions }: ItemsProps) {
  return (
    <BaseAccordion.Root render={<AccordionList />}>
      {questions.map((faqQuestion, index) => (
        <Item
          key={index}
          question={faqQuestion}
          value={`faq-${index}`}
        />
      ))}
    </BaseAccordion.Root>
  );
}
