import { type ComponentType } from 'react';

import { ContactsVisual } from '../ContactsVisual';
import { DashboardVisual } from '../DashboardVisual';
import { EmailsVisual } from '../EmailsVisual';
import { FilesVisual } from '../FilesVisual';
import { ImportVisual } from '../ImportVisual';
import { PipelineVisual } from '../PipelineVisual';
import { TasksVisual } from '../TasksVisual';
import { type FeatureVisualKey } from '../types/feature-visual-key';

export const VISUALS: Record<
  FeatureVisualKey,
  ComponentType<{ active: boolean }>
> = {
  contacts: ContactsVisual,
  dashboard: DashboardVisual,
  emails: EmailsVisual,
  files: FilesVisual,
  import: ImportVisual,
  pipeline: PipelineVisual,
  tasks: TasksVisual,
};
