import { styled } from '@linaria/react';
import { THEME_LIGHT } from 'twenty-ui/theme';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';

import { EASING } from '@/tokens';

import { type RecordCalendarDay } from '../../types';
import { AvatarGroup } from './avatar-group';
import { RECORD_PANEL_CHROME } from './record-panel-chrome';

const CalendarDayRow = styled.div<{ $index: number }>`
  align-items: flex-start;
  animation: calendarDayAppear 360ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  display: flex;
  gap: 12px;
  padding: 8px 12px;

  & + & {
    border-top: 1px solid ${THEME_LIGHT.border.color.light};
  }

  @keyframes calendarDayAppear {
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

const DayBadge = styled.div`
  flex-shrink: 0;
  text-align: center;
  width: 28px;
`;

const WeekDay = styled.div`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const MonthDay = styled.div`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 14px;
  font-weight: 500;
`;

const DayEvents = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const CalEventRow = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  height: 24px;
`;

const AttendanceBar = styled.span<{ $active?: boolean }>`
  background: ${({ $active }) =>
    $active ? THEME_LIGHT.accent.accent9 : THEME_LIGHT.border.color.strong};
  border-radius: ${THEME_LIGHT.border.radius.xs};
  flex-shrink: 0;
  height: 24px;
  width: 4px;
`;

const CalLabels = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

const CalTime = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  gap: 4px;
`;

const CalTitle = styled.div`
  color: ${THEME_LIGHT.font.color.primary};
  font-family: ${THEME_LIGHT.font.family};
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const {
  ListCard,
  TabAddButton,
  TabHeader,
  TabHeaderCount,
  TabHeaderLabel,
  TabHeaderTitle,
  TabSection,
} = RECORD_PANEL_CHROME;

export function RecordCalendar({
  calendar,
}: {
  calendar: RecordCalendarDay[];
}) {
  return (
    <TabSection>
      <TabHeader>
        <TabHeaderLabel>
          <TabHeaderTitle>June</TabHeaderTitle>
          <TabHeaderCount>
            {calendar.reduce((total, day) => total + day.events.length, 0)}
          </TabHeaderCount>
        </TabHeaderLabel>
        <TabAddButton>
          <IconPlus size={14} stroke={2} />
          Add event
        </TabAddButton>
      </TabHeader>
      <ListCard>
        {calendar.map((day, index) => (
          <CalendarDayRow $index={index} key={day.id}>
            <DayBadge>
              <WeekDay>{day.weekday}</WeekDay>
              <MonthDay>{day.day}</MonthDay>
            </DayBadge>
            <DayEvents>
              {day.events.map((event) => (
                <CalEventRow key={event.id}>
                  <AttendanceBar $active={event.attending} />
                  <CalLabels>
                    <CalTime>
                      {event.start}
                      <IconArrowRight
                        size={14}
                        stroke={THEME_LIGHT.icon.stroke.sm}
                      />
                      {event.end}
                    </CalTime>
                    <CalTitle>{event.title}</CalTitle>
                  </CalLabels>
                  <AvatarGroup people={event.participants} size={16} />
                </CalEventRow>
              ))}
            </DayEvents>
          </CalendarDayRow>
        ))}
      </ListCard>
    </TabSection>
  );
}
