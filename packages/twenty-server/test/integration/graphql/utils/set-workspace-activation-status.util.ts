import { type WorkspaceActivationStatus } from 'twenty-shared/workspace';

// activationStatus has no update API, so it is set directly
export const setWorkspaceActivationStatus = ({
  workspaceId,
  activationStatus,
}: {
  workspaceId: string;
  activationStatus: WorkspaceActivationStatus;
}) =>
  globalThis.testDataSource.query(
    `UPDATE core."workspace" SET "activationStatus" = $1 WHERE "id" = $2`,
    [activationStatus, workspaceId],
  );
