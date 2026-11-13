import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  DURATION,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

import { type ProgramStep } from './program-steps.data';

// Same recipe as partner-lead/PartnerServicesExplainer, so program pages read
// like /partners; sections may not import each other.
const ExplainerGrid = styled.div`
  column-gap: ${spacing(10)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: ${spacing(8)};
  scroll-margin-top: ${spacing(24)};

  ${mediaUp('md')} {
    grid-template-columns: 340px minmax(0, 1fr);
  }
`;

const ExplainerAside = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    align-self: start;
    position: sticky;
    top: ${spacing(24)};
  }
`;

const ExplainerStack = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ExplainerCard = styled.li`
  align-items: flex-start;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  padding: ${spacing(5)} ${spacing(6)};
  transition: box-shadow ${DURATION.xs} ease;

  &:hover {
    box-shadow: ${SHADOW.card};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const ExplainerMarker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  height: 7px;
  margin-top: ${spacing(2)};
  width: 14px;
`;

const ExplainerTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin-bottom: ${spacing(1)};
`;

type ProgramExplainerProps = {
  anchorId: string;
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  body: MessageDescriptor;
  steps: readonly ProgramStep[];
};

export function ProgramExplainer({
  anchorId,
  eyebrow,
  heading,
  body,
  steps,
}: ProgramExplainerProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <ExplainerGrid id={anchorId}>
        <ExplainerAside>
          <Eyebrow>{i18n._(eyebrow)}</Eyebrow>
          <Heading as="h2" size="sm" weight="light">
            {i18n._(heading)}
          </Heading>
          <Body muted size="sm">
            {i18n._(body)}
          </Body>
        </ExplainerAside>
        <ExplainerStack>
          {steps.map((step) => (
            <ExplainerCard key={step.title.id}>
              <ExplainerMarker aria-hidden />
              <div>
                <ExplainerTitle>{i18n._(step.title)}</ExplainerTitle>
                <Body muted size="sm">
                  {i18n._(step.body)}
                </Body>
              </div>
            </ExplainerCard>
          ))}
        </ExplainerStack>
      </ExplainerGrid>
    </SectionShell>
  );
}
