import { z } from 'zod';

import { type WorkspaceSetupSnapshot } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-snapshot.type';
import { buildWorkspaceSnapshotMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-snapshot-message-text.util';

export const GET_WORKSPACE_SNAPSHOT_TOOL_NAME = 'get_workspace_snapshot';

export const getWorkspaceSnapshotInputSchema = z.object({});

export const createGetWorkspaceSnapshotTool = (
  getSnapshot: () => Promise<WorkspaceSetupSnapshot>,
) => ({
  description:
    'Read the workspace data again, fresh: whether a mailbox is connected and how far its sync ' +
    'is, how many emails are imported, the records the user owns versus sample data, and the ' +
    'companies and people they email the most, as record references. Same format as the data ' +
    'in the first message. Call it when the user asks you to look again, for example after ' +
    'connecting their mailbox; it needs no learn_tools step.',
  inputSchema: getWorkspaceSnapshotInputSchema,
  execute: async () => ({
    success: true,
    message: buildWorkspaceSnapshotMessageText(await getSnapshot()),
  }),
});
