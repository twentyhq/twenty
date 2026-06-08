'use client';

import { styled } from '@linaria/react';
import { IconArrowRight } from '@tabler/icons-react';

import { SHARED_PEOPLE_AVATAR_URLS } from '@/content/site/asset-paths';

import {
  BG_PANEL,
  CARD_BORDER,
  CARD_TEXT,
  CARD_TEXT_TERTIARY,
  TEXT_LIGHT,
} from '../visual-tokens';

const Wrap = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Year = styled.div`
  color: ${TEXT_LIGHT};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const MonthCard = styled.div`
  border: 1px solid ${CARD_BORDER};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DayRow = styled.div`
  background: ${BG_PANEL};
  border-bottom: 1px solid ${CARD_BORDER};
  display: flex;
  gap: 12px;
  padding: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const DayCol = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 24px;
`;

const WeekDay = styled.div`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

const MonthDay = styled.div`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 500;
`;

const Events = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const Event = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  height: 24px;
`;

const Bar = styled.span`
  background: rgba(255, 255, 255, 0.16);
  border-radius: 2px;
  flex-shrink: 0;
  height: 100%;
  width: 4px;
`;

const Labels = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

const Time = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;
  width: 88px;

  svg {
    height: 12px;
    width: 12px;
  }
`;

const Title = styled.span`
  color: ${CARD_TEXT};
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Attendees = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const Attendee = styled.img`
  border: 1.5px solid ${BG_PANEL};
  border-radius: 999px;
  height: 16px;
  object-fit: cover;
  width: 16px;

  & + & {
    margin-left: -5px;
  }
`;

const DAYS: {
  weekday: string;
  day: string;
  events: { start: string; end: string; title: string; attendees: string[] }[];
}[] = [
  {
    weekday: 'Mon',
    day: '24',
    events: [
      {
        start: '10:00',
        end: '11:00',
        title: 'Kickoff call with Anthropic',
        attendees: [
          SHARED_PEOPLE_AVATAR_URLS.darioAmodei,
          SHARED_PEOPLE_AVATAR_URLS.timCook,
        ],
      },
    ],
  },
  {
    weekday: 'Tue',
    day: '25',
    events: [
      {
        start: '14:30',
        end: '15:00',
        title: 'Security review',
        attendees: [SHARED_PEOPLE_AVATAR_URLS.darioAmodei],
      },
    ],
  },
  {
    weekday: 'Thu',
    day: '27',
    events: [
      {
        start: '11:00',
        end: '12:00',
        title: 'Pricing sync',
        attendees: [
          SHARED_PEOPLE_AVATAR_URLS.patrickCollison,
          SHARED_PEOPLE_AVATAR_URLS.timCook,
        ],
      },
    ],
  },
  {
    weekday: 'Fri',
    day: '28',
    events: [
      {
        start: '16:00',
        end: '17:00',
        title: 'Quarterly planning',
        attendees: [
          SHARED_PEOPLE_AVATAR_URLS.dylanField,
          SHARED_PEOPLE_AVATAR_URLS.timCook,
        ],
      },
    ],
  },
];

export function CalendarTab() {
  return (
    <Wrap>
      <Year>2026</Year>
      <MonthCard>
        {DAYS.map((dayGroup) => (
          <DayRow key={dayGroup.day}>
            <DayCol>
              <WeekDay>{dayGroup.weekday}</WeekDay>
              <MonthDay>{dayGroup.day}</MonthDay>
            </DayCol>
            <Events>
              {dayGroup.events.map((event) => (
                <Event key={event.title}>
                  <Bar />
                  <Labels>
                    <Time>
                      {event.start}
                      <IconArrowRight />
                      {event.end}
                    </Time>
                    <Title>{event.title}</Title>
                  </Labels>
                  <Attendees>
                    {event.attendees.map((url, index) => (
                      <Attendee alt="" key={index} src={url} />
                    ))}
                  </Attendees>
                </Event>
              ))}
            </Events>
          </DayRow>
        ))}
      </MonthCard>
    </Wrap>
  );
}
