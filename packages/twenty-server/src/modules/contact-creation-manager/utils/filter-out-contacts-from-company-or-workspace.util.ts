import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export function filterOutSelfAndContactsFromCompanyOrWorkspace(
  contacts: Contact[],
  connectedAccount: ConnectedAccountWorkspaceEntity,
  workspaceMembers: WorkspaceMemberWorkspaceEntity[],
): Contact[] {
  const selfDomainName = getDomainNameFromHandle(connectedAccount.handle);

  const handleAliases = connectedAccount.handleAliases?.split(',') || [];

  const workspaceMembersMap = workspaceMembers.reduce(
    (map, workspaceMember) => {
      map[workspaceMember.userEmail] = true;

      return map;
    },
    new Map<string, boolean>(),
  );

  return contacts.filter(
    (contact) =>
      getDomainNameFromHandle(contact.handle) !== selfDomainName &&
      !workspaceMembersMap[contact.handle] &&
      !handleAliases.includes(contact.handle),
  );
}
