import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
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
import {
  Body,
  CornerMarkers,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

const CAPABILITIES: readonly {
  title: MessageDescriptor;
  body: MessageDescriptor;
}[] = [
  {
    title: msg`Ask questions`,
    body: msg`Mention @Twenty in a channel or send it a direct message. It searches your workspace and replies in the thread.`,
  },
  {
    title: msg`Create and update records`,
    body: msg`Create and update people, companies, opportunities, notes and tasks without leaving Slack.`,
  },
  {
    title: msg`Preview record links`,
    body: msg`Paste a link to a Twenty record and Slack shows a preview of it.`,
  },
  {
    title: msg`Post from workflows`,
    body: msg`Your Twenty workflows can post, update and react to Slack messages.`,
  },
];

const SETUP_STEPS: readonly {
  title: MessageDescriptor;
  body: MessageDescriptor;
}[] = [
  {
    title: msg`Install the app`,
    body: msg`Click Install at the top of this page and add the Slack app to your Twenty workspace.`,
  },
  {
    title: msg`Connect Slack`,
    body: msg`In the app's Connections, click Add connection and approve the install in Slack.`,
  },
  {
    title: msg`Link your accounts`,
    body: msg`Accounts with the same email in Slack and Twenty are linked automatically. An admin can link the rest from the app's Settings tab, and the Slack user approves the link in a direct message from the bot.`,
  },
  {
    title: msg`Start asking`,
    body: msg`Invite the bot to a channel with /invite @Twenty, then mention @Twenty with your question or send it a direct message.`,
  },
];

const EXAMPLE_QUESTIONS: readonly MessageDescriptor[] = [
  msg`How many open opportunities do we have?`,
  msg`Which deals are closing this month?`,
  msg`What do we know about Acme Corp?`,
  msg`Create a company called Acme Corp`,
  msg`Add a note to Jane Doe: follow up on pricing next week`,
  msg`Create a task to send Acme the proposal by Friday`,
];

const ExplainerGrid = styled.div`
  display: grid;
  gap: ${spacing(8)} ${spacing(10)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

const Disclaimer = styled.div`
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};
  position: relative;
`;

const ExplainerStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
`;

const Card = styled.div`
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

const Marker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  height: 7px;
  margin-top: ${spacing(2)};
  width: 14px;
`;

const CardTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin-bottom: ${spacing(1)};
`;

const StepGrid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StepCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const StepNumber = styled.span`
  color: ${color('blue')};
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
`;

const ExampleGrid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export function SlackAppDetailContent() {
  const i18n = getServerI18n();

  return (
    <>
      <SectionShell rhythm="section" scheme="muted">
        <ExplainerGrid>
          <ExplainerAside>
            <Eyebrow>{i18n._(msg`How it works`)}</Eyebrow>
            <Heading as="h2" size="sm" weight="light">
              {i18n._(msg`Your CRM, inside Slack`)}
            </Heading>
            <Body muted size="sm">
              {i18n._(
                msg`Mention @Twenty in a channel or send it a direct message, and ask in plain language. It looks up records in your Twenty workspace, makes the changes you ask for and replies in the thread, so the answer lands where the conversation is happening.`,
              )}
            </Body>
            <Body muted size="sm">
              {i18n._(
                msg`It only answers people whose Slack account is linked to a Twenty user, and it acts with that user's permissions, so it can't see or change anything they couldn't in Twenty.`,
              )}
            </Body>
            <Body muted size="sm">
              {i18n._(
                msg`Admins connect the Slack workspace and manage which Slack accounts are linked from the app's settings in Twenty.`,
              )}
            </Body>
            <Disclaimer>
              <CornerMarkers />
              <Body size="sm">
                {i18n._(
                  msg`Answers are generated by AI and can be inaccurate. Check important details in Twenty before acting on them.`,
                )}
              </Body>
            </Disclaimer>
          </ExplainerAside>
          <ExplainerStack>
            {CAPABILITIES.map((capability) => (
              <Card key={capability.title.id}>
                <Marker aria-hidden />
                <div>
                  <CardTitle>{i18n._(capability.title)}</CardTitle>
                  <Body muted size="sm">
                    {i18n._(capability.body)}
                  </Body>
                </div>
              </Card>
            ))}
          </ExplainerStack>
        </ExplainerGrid>
      </SectionShell>

      <SectionShell rhythm="section" scheme="light">
        <SectionStack>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`Examples`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`What *you can ask*`)}
            </Heading>
          </SectionIntro>
          <ExampleGrid>
            {EXAMPLE_QUESTIONS.map((question) => (
              <Card key={question.id}>
                <Marker aria-hidden />
                <Body size="md">&ldquo;{i18n._(question)}&rdquo;</Body>
              </Card>
            ))}
          </ExampleGrid>
        </SectionStack>
      </SectionShell>

      <SectionShell rhythm="section" scheme="muted">
        <SectionStack>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`Getting started`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Set up *in four steps*`)}
            </Heading>
          </SectionIntro>
          <StepGrid>
            {SETUP_STEPS.map((step, index) => (
              <StepCard key={step.title.id}>
                <StepNumber aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </StepNumber>
                <CardTitle>{i18n._(step.title)}</CardTitle>
                <Body muted size="sm">
                  {i18n._(step.body)}
                </Body>
              </StepCard>
            ))}
          </StepGrid>
        </SectionStack>
      </SectionShell>
    </>
  );
}
