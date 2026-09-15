import { type I18n } from '@lingui/core';
import { type MessageDescriptor } from '@lingui/core';

type FaqEntry = { question: MessageDescriptor; answer: MessageDescriptor };

export const buildFaqPageJsonLd = (
  i18n: I18n,
  questions: readonly FaqEntry[],
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((entry) => ({
    '@type': 'Question',
    name: i18n._(entry.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: i18n._(entry.answer),
    },
  })),
});
