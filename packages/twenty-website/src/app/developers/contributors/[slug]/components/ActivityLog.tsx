'use client';

import styled from '@emotion/styled';
import { ResponsiveTimeRange } from '@nivo/calendar';

const Container = styled.div`
  border: 3px solid #141414;
  width: 100%;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  gap: 32px;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 32px;
  line-height: 41.6px;
  font-weight: 500;
`;

export const ActivityLog = ({
  data,
}: {
  data: { value: number; day: string }[];
}) => {
  return (
    <Container>
      <Title>Activity</Title>
      <div style={{ width: '100%', height: '140px' }}>
        <ResponsiveTimeRange
          data={data}
          emptyColor="#F4EFFF"
          colors={['#E9DFFF', '#B28FFE', '#915FFD']}
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
        />
      </div>
    </Container>
  );
};
