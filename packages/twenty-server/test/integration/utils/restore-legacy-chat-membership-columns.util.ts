import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { type DropLegacyChatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791730401449-drop-legacy-chat-columns.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const runInWorkspace = <TResult>(
  workspaceId: string,
  work: () => Promise<TResult>,
) =>
  getAppProviderByClassName<WorkspaceOrmManager>(
    'WorkspaceOrmManager',
  ).executeInWorkspaceContext(work, buildSystemAuthContext(workspaceId));

// Commands from before 2.47 read chats by the membership columns 2.47
// dropped, so a suite running them brings the columns back, filled from the
// members that replaced them
export const restoreLegacyChatMembershipColumns = async (
  workspaceId: string,
): Promise<void> => {
  await runInWorkspace(workspaceId, () =>
    getAppProviderByClassName<AgentHistorySchemaService>(
      'AgentHistorySchemaService',
    ).prepare(workspaceId, false),
  );

  const schema = getWorkspaceSchemaName(workspaceId);

  await global.testDataSource.query(
    `UPDATE "${schema}"."agentChatThread" thread
     SET "userWorkspaceId" = membership.id
     FROM "${schema}"."workspaceMember" member
     JOIN core."userWorkspace" membership
       ON membership."userId" = member."userId" AND membership."workspaceId" = $1
     WHERE member.id = thread."workspaceMemberId"`,
    [workspaceId],
  );
};

export const dropLegacyChatMembershipColumns = (
  workspaceId: string,
): Promise<void> =>
  runInWorkspace(workspaceId, () =>
    getAppProviderByClassName<DropLegacyChatColumnsCommand>(
      'DropLegacyChatColumnsCommand',
    ).up({ workspaceId, options: {}, index: 0, total: 1 }),
  );
