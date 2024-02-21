'use client';

import { ResponsiveTimeRange } from '@nivo/calendar';

import { CardContainer } from '@/app/developers/contributors/[slug]/components/CardContainer';
import { Title } from '@/app/developers/contributors/[slug]/components/Title';

export const ActivityLog = ({
  data,
}: {
  data: { value: number; day: string }[];
}) => {
  if (!data.length) {
    return null;
  }
  return (
    <CardContainer>
      <Title>Activity</Title>
      <div style={{ width: '100%', height: '214px' }}>
        <ResponsiveTimeRange
          data={data}
          emptyColor="#F4EFFF"
          colors={['#E9DFFF', '#B28FFE', '#915FFD']}
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          dayRadius={4}
          daySpacing={2}
        />
      </div>
    </CardContainer>
  );
};
