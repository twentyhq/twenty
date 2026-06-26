import { type MessageDescriptor } from '@lingui/core';

import { type DashboardStageTone } from './dashboard-stage-tone';

export type DashboardStage = {
  id: string;
  label: MessageDescriptor;
  tone: DashboardStageTone;
  value: number;
};
