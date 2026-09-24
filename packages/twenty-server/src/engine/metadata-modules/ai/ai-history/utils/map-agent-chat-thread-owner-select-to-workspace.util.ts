import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadOwnerFields } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-fields.util';
import { type WorkspaceFindOptions } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';

export const mapAgentChatThreadOwnerSelectToWorkspace = ({
  select,
  ownerFields,
}: {
  select: WorkspaceFindOptions['select'];
  ownerFields: AgentChatThreadOwnerFields;
}): WorkspaceFindOptions['select'] => {
  if (!isDefined(select) || ownerFields.hasUserWorkspaceIdField) {
    return select;
  }

  if (Array.isArray(select)) {
    return select.map((fieldName) =>
      fieldName === 'userWorkspaceId' ? 'workspaceMemberId' : fieldName,
    );
  }

  return Object.fromEntries(
    Object.entries(select).map(([fieldName, value]) => [
      fieldName === 'userWorkspaceId' ? 'workspaceMemberId' : fieldName,
      value,
    ]),
  );
};
