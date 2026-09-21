import { isNonEmptyString } from '@sniptt/guards';

export type WorkspaceEvaluationModelCandidate = {
  workspacePinnedModelId?: string | null;
  // Whether the pin still names a model this instance can run.
  isPinnedModelRunnable: boolean;
  // Administrators can withdraw a model instance-wide, and a workspace pin
  // must not be a way around that.
  isPinnedModelAdminAllowed: boolean;
  instanceDefaultModelId?: string;
};

// Which evaluation model a step that names none lands on.
//
// Unlike a pin on the step itself, a workspace pin is a preference rather than
// a decision about this run: a step that named no model cannot be said to have
// asked for the pinned one, so a pin that no longer resolves falls through to
// whatever the instance offers instead of failing the run.
export const resolveWorkspaceEvaluationModelId = ({
  workspacePinnedModelId,
  isPinnedModelRunnable,
  isPinnedModelAdminAllowed,
  instanceDefaultModelId,
}: WorkspaceEvaluationModelCandidate): string | undefined => {
  if (
    isNonEmptyString(workspacePinnedModelId) &&
    isPinnedModelRunnable &&
    isPinnedModelAdminAllowed
  ) {
    return workspacePinnedModelId;
  }

  return instanceDefaultModelId;
};
