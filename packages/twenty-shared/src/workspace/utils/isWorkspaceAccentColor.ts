import { WORKSPACE_ACCENT_COLORS } from '@/workspace/constants/WorkspaceAccentColors';
import { type WorkspaceAccentColor } from '@/workspace/types/WorkspaceAccentColor';

export const isWorkspaceAccentColor = (
  value: unknown,
): value is WorkspaceAccentColor =>
  WORKSPACE_ACCENT_COLORS.includes(value as WorkspaceAccentColor);
