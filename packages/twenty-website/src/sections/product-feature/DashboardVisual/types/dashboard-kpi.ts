import { type MessageDescriptor } from '@lingui/core';

export type DashboardKpi = {
  id: string;
  label: MessageDescriptor;
  trendDirection: 'down' | 'up';
  trendPercent: number;
  value: string;
};
