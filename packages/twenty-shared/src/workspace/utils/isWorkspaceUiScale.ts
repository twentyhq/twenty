import { WORKSPACE_UI_SCALES } from '@/workspace/constants/WorkspaceUiScales';
import { type WorkspaceUiScale } from '@/workspace/types/WorkspaceUiScale';

export const isWorkspaceUiScale = (value: unknown): value is WorkspaceUiScale =>
  WORKSPACE_UI_SCALES.some((uiScale) => uiScale === value);
