export const buildAgentChatChannelAccessQuery = ({
  workspaceIdParameter,
}: {
  workspaceIdParameter: string;
}): string =>
  `SELECT channel_role."channelId" AS channel_id, channel_role."roleId" AS role_id
   FROM core."agentChatChannelRole" channel_role
   WHERE channel_role."workspaceId" = ${workspaceIdParameter}
   UNION
   SELECT channel.id, workspace_role.id
   FROM core."agentChatChannel" channel
   JOIN core."role" workspace_role
     ON workspace_role."workspaceId" = channel."workspaceId"
     AND workspace_role."canAccessAllAgentChatChannels"
   WHERE channel."workspaceId" = ${workspaceIdParameter}`;
