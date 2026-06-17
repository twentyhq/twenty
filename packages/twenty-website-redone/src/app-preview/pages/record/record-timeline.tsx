import { styled } from '@linaria/react';
import {
  IconCalendarEvent,
  IconChevronUp,
  IconCirclePlus,
  IconEditCircle,
  IconNotes,
} from '@tabler/icons-react';

import { EASING } from '@/tokens';
import { THEME_LIGHT as theme } from 'twenty-ui/theme';

import { PersonAvatar } from '../../primitives/person-avatar';
import { PreviewTag } from '../../primitives/preview-tag';
import { PREVIEW_COLORS } from '../../preview-colors';
import { type RecordFieldValue, type TimelineEvent } from '../../types';

const TimelineFeed = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px 24px 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MonthSeparator = styled.div`
  align-items: center;
  color: ${PREVIEW_COLORS.textLight};
  display: flex;
  font-family: ${theme.font.family};
  font-size: 12px;
  font-weight: 600;
  gap: 16px;
  margin-bottom: 16px;
`;

const MonthSeparatorLine = styled.div`
  background: ${PREVIEW_COLORS.borderLight};
  border-radius: 50px;
  flex: 1;
  height: 1px;
`;

const TimelineGroup = styled.div`
  position: relative;
`;

// The 24px rounded rail twenty-front renders behind the event icons.
const TimelineRail = styled.div`
  background: ${PREVIEW_COLORS.backgroundSecondary};
  border: 1px solid ${PREVIEW_COLORS.borderLight};
  border-radius: 8px;
  bottom: 0;
  left: 0;
  position: absolute;
  top: 0;
  width: 24px;
  z-index: 0;
`;

const TimelineRow = styled.div<{ $index: number }>`
  animation: timelineRowAppear 360ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;

  @keyframes timelineRowAppear {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TimelineGutter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 24px;
`;

const TimelineIconBox = styled.div`
  align-items: center;
  color: ${PREVIEW_COLORS.textTertiary};
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const TimelineConnector = styled.div<{ $hidden: boolean }>`
  background: ${PREVIEW_COLORS.borderLight};
  flex: 1;
  margin: 4px 0;
  min-height: 12px;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  width: 2px;
`;

const TimelineMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-bottom: 16px;
`;

const TimelineSummary = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: space-between;
  min-height: 24px;
`;

const TimelineSummaryLeft = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
`;

const TimelineActor = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
`;

const TimelineAction = styled.span`
  color: ${PREVIEW_COLORS.textSecondary};
  font-family: ${theme.font.family};
  font-size: 13px;
  white-space: nowrap;
`;

const TimelineSubject = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
`;

const TimelineDiffLabel = styled.span`
  color: ${PREVIEW_COLORS.textSecondary};
  font-family: ${theme.font.family};
  font-size: 13px;
  white-space: nowrap;
`;

const TimelineArrow = styled.span`
  color: ${PREVIEW_COLORS.textTertiary};
  font-family: ${theme.font.family};
  font-size: 13px;
`;

const TimelineValueText = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  white-space: nowrap;
`;

const TimelineDiffPerson = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const TimelineLinkedTitle = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  overflow: hidden;
  text-decoration: underline;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TimelineTime = styled.span`
  color: ${PREVIEW_COLORS.textTertiary};
  flex-shrink: 0;
  font-family: ${theme.font.family};
  font-size: 13px;
  padding-left: 8px;
  white-space: nowrap;
`;

const TimelineToggle = styled.span`
  align-items: center;
  border: 1px solid ${PREVIEW_COLORS.borderLight};
  border-radius: 4px;
  color: ${PREVIEW_COLORS.textTertiary};
  display: inline-flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const TimelineCardOuter = styled.div`
  max-width: 360px;
  padding-top: 2px;
  width: 100%;
`;

const TimelineCardInner = styled.div`
  background: ${PREVIEW_COLORS.backgroundSecondary};
  border: 1px solid ${PREVIEW_COLORS.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
`;

const TimelineDiffRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
`;

const TimelineCardTitle = styled.div`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  font-weight: 500;
`;

const TimelineCardText = styled.div`
  color: ${PREVIEW_COLORS.textSecondary};
  font-family: ${theme.font.family};
  font-size: 13px;
  line-height: 1.4;
`;

function TimelineEventIcon({ kind }: { kind: TimelineEvent['kind'] }) {
  const stroke = theme.icon.stroke.sm;
  switch (kind) {
    case 'created':
      return <IconCirclePlus size={16} stroke={stroke} />;
    case 'updated':
      return <IconEditCircle size={16} stroke={stroke} />;
    case 'note':
      return <IconNotes size={16} stroke={stroke} />;
    case 'calendar':
      return <IconCalendarEvent size={16} stroke={stroke} />;
    default:
      return null;
  }
}

function TimelineDiffValue({ value }: { value: RecordFieldValue }) {
  switch (value.type) {
    case 'select':
      return <PreviewTag color={value.color} label={value.value} />;
    case 'person':
      return (
        <TimelineDiffPerson>
          <PersonAvatar person={value} size={16} />
          <TimelineValueText>{value.name}</TimelineValueText>
        </TimelineDiffPerson>
      );
    case 'boolean':
      return (
        <TimelineValueText>{value.value ? 'True' : 'False'}</TimelineValueText>
      );
    case 'currency':
    case 'text':
      return <TimelineValueText>{value.value}</TimelineValueText>;
    case 'link':
      return (
        <TimelineValueText>{value.label ?? value.value}</TimelineValueText>
      );
    default:
      return null;
  }
}

function TimelineEventSummary({ event }: { event: TimelineEvent }) {
  const stroke = theme.icon.stroke.sm;
  switch (event.kind) {
    case 'created':
      return (
        <>
          <TimelineSubject>{event.subject}</TimelineSubject>
          <TimelineAction>was created by</TimelineAction>
          <TimelineActor>{event.actor}</TimelineActor>
        </>
      );
    case 'note':
      return (
        <>
          <TimelineActor>{event.actor}</TimelineActor>
          <TimelineAction>created a note</TimelineAction>
          <TimelineLinkedTitle>{event.title}</TimelineLinkedTitle>
        </>
      );
    case 'calendar':
      return (
        <>
          <TimelineActor>{event.actor}</TimelineActor>
          <TimelineAction>added a calendar event</TimelineAction>
          <TimelineSubject>{event.title}</TimelineSubject>
          <TimelineToggle>
            <IconChevronUp size={12} stroke={stroke} />
          </TimelineToggle>
        </>
      );
    case 'updated':
      if (event.diffs.length === 1) {
        return (
          <>
            <TimelineActor>{event.actor}</TimelineActor>
            <TimelineAction>updated</TimelineAction>
            <TimelineDiffLabel>{event.diffs[0].label}</TimelineDiffLabel>
            <TimelineArrow>→</TimelineArrow>
            <TimelineDiffValue value={event.diffs[0].value} />
          </>
        );
      }

      return (
        <>
          <TimelineActor>{event.actor}</TimelineActor>
          <TimelineAction>updated</TimelineAction>
          <TimelineSubject>
            {event.diffs.length} fields on {event.record}
          </TimelineSubject>
          <TimelineToggle>
            <IconChevronUp size={12} stroke={stroke} />
          </TimelineToggle>
        </>
      );
    default:
      return null;
  }
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  if (event.kind === 'updated' && event.diffs.length > 1) {
    return (
      <TimelineCardOuter>
        <TimelineCardInner>
          {event.diffs.map((diff) => (
            <TimelineDiffRow key={diff.label}>
              <TimelineDiffLabel>{diff.label}</TimelineDiffLabel>
              <TimelineArrow>→</TimelineArrow>
              <TimelineDiffValue value={diff.value} />
            </TimelineDiffRow>
          ))}
        </TimelineCardInner>
      </TimelineCardOuter>
    );
  }

  if (event.kind === 'calendar') {
    return (
      <TimelineCardOuter>
        <TimelineCardInner>
          <TimelineCardTitle>{event.title}</TimelineCardTitle>
          <TimelineCardText>{event.detail}</TimelineCardText>
        </TimelineCardInner>
      </TimelineCardOuter>
    );
  }

  return null;
}

export function RecordTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <TimelineFeed>
      <MonthSeparator>
        Today
        <MonthSeparatorLine />
      </MonthSeparator>
      <TimelineGroup>
        <TimelineRail />
        {timeline.map((event, index) => (
          <TimelineRow $index={index} key={event.id}>
            <TimelineGutter>
              <TimelineIconBox>
                <TimelineEventIcon kind={event.kind} />
              </TimelineIconBox>
              <TimelineConnector $hidden={index === timeline.length - 1} />
            </TimelineGutter>
            <TimelineMain>
              <TimelineSummary>
                <TimelineSummaryLeft>
                  <TimelineEventSummary event={event} />
                </TimelineSummaryLeft>
                <TimelineTime>{event.time}</TimelineTime>
              </TimelineSummary>
              <TimelineEventCard event={event} />
            </TimelineMain>
          </TimelineRow>
        ))}
      </TimelineGroup>
    </TimelineFeed>
  );
}
