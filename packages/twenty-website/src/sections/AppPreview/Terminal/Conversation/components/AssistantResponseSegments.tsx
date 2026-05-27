import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import type { AssistantResponseStreamingStage } from '../utils/assistant-response-stage';
import type { StreamingSegment } from '../types/streaming-text-types';

const InlineCode = styled.span`
  background: rgba(0, 0, 0, 0.045);
  border-radius: 3px;
  color: rgba(0, 0, 0, 0.78);
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;
  padding: 1px 5px;
`;

const FileLink = styled.span`
  color: #2a66de;
  cursor: pointer;
  font-family: ${TERMINAL_TOKENS.font.mono};
  font-size: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const ReferenceLink = styled.a`
  color: #2a66de;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #1e4ea8;
  }
`;

const text = (value: string, onReveal?: () => void): StreamingSegment => ({
  kind: 'text',
  value,
  onReveal,
});

const node = (
  key: string,
  value: ReactNode,
  onReveal?: () => void,
): StreamingSegment => ({
  kind: 'node',
  value: <span key={key}>{value}</span>,
  onReveal,
});

const ROCKET_ID = 'rockets';
const LAUNCH_ID = 'launches';
const PAYLOAD_ID = 'payloads';
const COMPANIES_ID = 'companies';
const LAUNCH_SITE_ID = 'launch-sites';

const buildIntroAndRocketParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text(
    "I'll scaffold a launch-ops CRM in your workspace: four new objects plus the standard ",
  ),
  node('rocket-companies', <InlineCode>Companies</InlineCode>),
  text(' object for customers, with shared UUIDs in '),
  node('rocket-ids', <FileLink>schema-identifiers.ts</FileLink>),
  text('. First up: '),
  node(
    'rocket-chip',
    <InlineCode>Rocket</InlineCode>,
    onObjectCreated ? () => onObjectCreated(ROCKET_ID) : undefined,
  ),
  text(
    '. Each vehicle gets a serial number, manufacturer, lifecycle status, reusability, launch date, dimensions, and target orbit in ',
  ),
  node('rocket-file', <FileLink>rocket.object.ts</FileLink>),
  text('.'),
];

const buildLaunchParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Next up: '),
  node(
    'launch-chip',
    <InlineCode>Launch</InlineCode>,
    onObjectCreated ? () => onObjectCreated(LAUNCH_ID) : undefined,
  ),
  text(
    '. Every mission gets a unique mission code, status, mission type, planned and actual launch times, and a summary. Defined in ',
  ),
  node('launch-file', <FileLink>launch.object.ts</FileLink>),
  text('.'),
];

const buildPayloadParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Now '),
  node(
    'payload-chip',
    <InlineCode>Payload</InlineCode>,
    onObjectCreated ? () => onObjectCreated(PAYLOAD_ID) : undefined,
  ),
  text(
    '. This covers what actually flies: satellites, crew capsules, cargo, probes, and landers, with type, status, target orbit, mass, and a customer reference. Scoped in ',
  ),
  node('payload-file', <FileLink>payload.object.ts</FileLink>),
  text('.'),
];

const buildCustomerParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('For customers, there is no new object. I reuse the standard '),
  node(
    'customer-chip',
    <InlineCode>Companies</InlineCode>,
    onObjectCreated ? () => onObjectCreated(COMPANIES_ID) : undefined,
  ),
  text(
    ' object that ships with Twenty, so accounts, domain favicons, and the People relation work for free. ',
  ),
  node('customer-file', <FileLink>payload.object.ts</FileLink>),
  text(' points its '),
  node('customer-field', <InlineCode>customer</InlineCode>),
  text(' relation straight at it.'),
];

const buildLaunchSiteParagraph = (
  onObjectCreated?: (id: string) => void,
): StreamingSegment[] => [
  text('Last object: '),
  node(
    'launch-site-chip',
    <InlineCode>Launch site</InlineCode>,
    onObjectCreated ? () => onObjectCreated(LAUNCH_SITE_ID) : undefined,
  ),
  text(
    '. This covers pads and ranges with a site code, country, region, pad name, and operational status. Lives in ',
  ),
  node('launch-site-file', <FileLink>launch-site.object.ts</FileLink>),
  text('.'),
];

const PINNED_ACTIONS_PARAGRAPH: StreamingSegment[] = [
  text(
    'Each object also gets 2-3 relevant quick commands pinned to its header. Next to ',
  ),
  node('pa-new', <InlineCode>New</InlineCode>),
  text(', '),
  node('pa-rocket', <InlineCode>Rocket</InlineCode>),
  text(' has reuse / retire shortcuts, '),
  node('pa-launch', <InlineCode>Launch</InlineCode>),
  text(' has '),
  node('pa-l-resched', <InlineCode>Reschedule</InlineCode>),
  text(' and '),
  node('pa-l-payload', <InlineCode>Add payload</InlineCode>),
  text(', '),
  node('pa-payload', <InlineCode>Payload</InlineCode>),
  text(' has '),
  node('pa-p-book', <InlineCode>Book slot</InlineCode>),
  text(', '),
  node('pa-companies', <InlineCode>Companies</InlineCode>),
  text(' has a quick '),
  node('pa-c-status', <InlineCode>Set status</InlineCode>),
  text(', and '),
  node('pa-site', <InlineCode>Launch site</InlineCode>),
  text(' has '),
  node('pa-s-window', <InlineCode>Book window</InlineCode>),
  text('. Defined under '),
  node('pa-folder', <FileLink>src/command-menu-items/</FileLink>),
  text('.'),
];

const WRAPUP_PARAGRAPH: StreamingSegment[] = [
  text('Relations wire '),
  node('w-rl', <InlineCode>Rocket → Launches</InlineCode>),
  text(', '),
  node('w-sl', <InlineCode>LaunchSite → Launches</InlineCode>),
  text(', '),
  node('w-cp', <InlineCode>Company → Payloads</InlineCode>),
  text(', and '),
  node('w-lp', <InlineCode>Launch → Payloads</InlineCode>),
  text('. Each object gets an index view and sidebar entry; '),
  node('w-launches', <InlineCode>Launches</InlineCode>),
  text(' also has '),
  node('w-upcoming', <FileLink>upcoming-launches.view.ts</FileLink>),
  text(' and '),
  node('w-past', <FileLink>past-launches.view.ts</FileLink>),
  text('. Verified with '),
  node('w-lint', <InlineCode>yarn lint</InlineCode>),
  text(', '),
  node('w-tsc', <InlineCode>tsc --noEmit</InlineCode>),
  text(', '),
  node(
    'w-vitest',
    <InlineCode>vitest run schema.integration-test.ts</InlineCode>,
  ),
  text(', and '),
  node('w-dev', <InlineCode>yarn twenty dev --once</InlineCode>),
  text('. Reference: '),
  node(
    'w-docs',
    <ReferenceLink
      href="https://twenty.com/developers"
      onClick={(event) => event.preventDefault()}
    >
      Twenty app-building docs
    </ReferenceLink>,
  ),
  text('.'),
];

export const buildAssistantResponseSegments = (
  onObjectCreated?: (id: string) => void,
): Record<AssistantResponseStreamingStage, StreamingSegment[]> => ({
  actions: PINNED_ACTIONS_PARAGRAPH,
  customer: buildCustomerParagraph(onObjectCreated),
  launch: buildLaunchParagraph(onObjectCreated),
  launchSite: buildLaunchSiteParagraph(onObjectCreated),
  payload: buildPayloadParagraph(onObjectCreated),
  rocket: buildIntroAndRocketParagraph(onObjectCreated),
  wrapup: WRAPUP_PARAGRAPH,
});
