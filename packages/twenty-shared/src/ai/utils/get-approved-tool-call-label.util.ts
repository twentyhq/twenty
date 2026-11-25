import { type ToolApprovalLabels } from '@/ai/types/ToolApprovalLabels';

export const getApprovedToolCallLabel = ({
  labels,
  toolName,
}: {
  labels: ToolApprovalLabels | undefined;
  toolName: string;
}): string | undefined =>
  labels?.alternatives?.[toolName]?.label ?? labels?.approve;
