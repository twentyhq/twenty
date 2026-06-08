'use client';

import { styled } from '@linaria/react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import {
  BG_DARK,
  BORDER_LIGHT,
  CARD_ACCENT,
  CARD_TEXT,
  CARD_TEXT_TERTIARY,
  TEXT_LIGHT,
} from '../visual-tokens';

const Wrap = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 16px 16px 0;
`;

const MonthSeparator = styled.div`
  align-items: center;
  color: ${TEXT_LIGHT};
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 12px;
  margin-bottom: 12px;
`;

const MonthSeparatorLine = styled.div`
  background: ${BORDER_LIGHT};
  border-radius: 50px;
  flex: 1;
  height: 1px;
`;

const Event = styled.div`
  align-items: center;
  border-bottom: 1px solid ${BORDER_LIGHT};
  display: flex;
  gap: 12px;
  padding: 10px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const Dot = styled.span`
  background: ${CARD_ACCENT};
  border-radius: 999px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const EventMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const EventTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EventMeta = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 11px;
`;

const Attendees = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const Attendee = styled.img`
  border: 1.5px solid ${BG_DARK};
  border-radius: 999px;
  height: 18px;
  object-fit: cover;
  width: 18px;

  & + & {
    margin-left: -5px;
  }
`;

const EVENTS: {
  title: string;
  meta: string;
  attendees: string[];
}[] = [
  {
    title: 'Kickoff call with Anthropic',
    meta: 'Mon 24 · 10:00 AM',
    attendees: [
      SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
      SHARED_PEOPLE_AVATAR_URLS.timCook,
    ],
  },
  {
    title: 'Security review',
    meta: 'Tue 25 · 2:30 PM',
    attendees: [SHARED_PEOPLE_AVATAR_URLS.darioAmodei],
  },
  {
    title: 'Pricing sync',
    meta: 'Thu 27 · 11:00 AM',
    attendees: [
      SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
      SHARED_PEOPLE_AVATAR_URLS.timCook,
    ],
  },
  {
    title: 'Quarterly planning',
    meta: 'Fri 28 · 4:00 PM',
    attendees: [
      SHARED_PEOPLE_AVATAR_URLS.dylanField,
      SHARED_PEOPLE_AVATAR_URLS.timCook,
    ],
  },
];

export function CalendarTab() {
  return (
    <Wrap>
      <MonthSeparator>
        July
        <MonthSeparatorLine />
      </MonthSeparator>
      {EVENTS.map((event) => (
        <Event key={event.title}>
          <Dot />
          <EventMain>
            <EventTitle>{event.title}</EventTitle>
            <EventMeta>{event.meta}</EventMeta>
          </EventMain>
          <Attendees>
            {event.attendees.map((url, index) => (
              <Attendee alt="" key={index} src={url} />
            ))}
          </Attendees>
        </Event>
      ))}
    </Wrap>
  );
}
