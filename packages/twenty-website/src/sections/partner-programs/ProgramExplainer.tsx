import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPair,
  SectionIntro,
  SectionShell,
} from '@/ui';

import { type ProgramStep } from './program-step.type';
import {
  type ProgramFooterRow,
  ProgramStepList,
  type ProgramStepListItem,
} from './ProgramStepList';

// A last row in the step card that is not a step: a marker stands in for the number.
type ProgramClosingRow = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  marker: ReactNode;
};

type ProgramExplainerProps = {
  anchorId: string;
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  steps: readonly ProgramStep[];
  closingRow?: ProgramClosingRow;
  footer?: readonly ProgramFooterRow[];
};

export function ProgramExplainer({
  anchorId,
  eyebrow,
  heading,
  body,
  steps,
  closingRow,
  footer,
}: ProgramExplainerProps) {
  const i18n = getServerI18n();
  const stepItems: ProgramStepListItem[] = steps.map((step) => ({
    title: i18n._(step.title),
    body: i18n._(step.body),
  }));
  if (isDefined(closingRow)) {
    stepItems.push({
      title: i18n._(closingRow.title),
      body: i18n._(closingRow.body),
      marker: closingRow.marker,
    });
  }

  return (
    <SectionShell rhythm="section" scheme="muted">
      <ProgramStepList
        anchorId={anchorId}
        intro={
          <SectionIntro>
            <Eyebrow>{i18n._(eyebrow)}</Eyebrow>
            <HeadingPair>
              <Heading as="h2" size="sm" weight="light">
                {i18n._(heading)}
              </Heading>
              <Body muted size="sm">
                {i18n._(body)}
              </Body>
            </HeadingPair>
          </SectionIntro>
        }
        steps={stepItems}
        footerRows={footer}
      />
    </SectionShell>
  );
}
