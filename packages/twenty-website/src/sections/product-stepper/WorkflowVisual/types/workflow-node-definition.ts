import { type MessageDescriptor } from '@lingui/core';

import { type WorkflowIconName } from './workflow-icon-name';

export type WorkflowNodeDefinition = {
  accent: 'blue' | 'gray' | 'green' | 'pink' | 'red';
  icon: WorkflowIconName;
  id: string;
  label: MessageDescriptor;
  type: MessageDescriptor;
  x: number;
  y: number;
};
