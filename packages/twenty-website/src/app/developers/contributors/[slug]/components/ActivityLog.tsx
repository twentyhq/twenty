'use client';

import { ResponsiveTimeRange } from '@nivo/calendar';

export const ActivityLog = ({
  data,
}: {
  data: { value: number; day: string }[];
}) => {
  return <ResponsiveTimeRange data={data} />;
};
