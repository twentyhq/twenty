'use client';

import styled from '@emotion/styled';
import { TimeRange } from '@nivo/calendar';

import { getActivityEndDate } from '@/app/(public)/contributors/utils/get-activity-end-date';
import { CardContainer } from '@/app/_components/contributors/CardContainer';
import { Title } from '@/app/_components/contributors/Title';

const CalendarContentContainer = styled.div`
  @media (max-width: 890px) {
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const ActivityLog = ({
  data,
}: {
  data: { value: number; day: string }[];
}) => {
  if (!data.length) {
    return null;
  }
  const endDate = getActivityEndDate(data);

  return (
    <CardContainer>
      <Title>Activity</Title>
      <CalendarContentContainer>
        <TimeRange
          height={150}
          width={725}
          data={data}
          to={endDate}
          emptyColor="#F4EFFF"
          colors={['#E9DFFF', '#B28FFE', '#915FFD']}
          weekdayTicks={[]}
          weekdayLegendOffset={0}
          dayBorderWidth={0}
          dayRadius={4}
          daySpacing={4}
        />
      </CalendarContentContainer>
    </CardContainer>
  );
};
