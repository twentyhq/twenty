import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkDomain } from 'src/utils/is-work-email';

export function filterOutSelfAndContactsFromCompanyOrWorkspace(
  contacts: Contact[],
  connectedAccount: ConnectedAccountWorkspaceEntity,
  workspaceMembers: WorkspaceMemberWorkspaceEntity[],
): Contact[] {
  const selfDomainName = getDomainNameFromHandle(connectedAccount.handle);

  const allHandles = [
    connectedAccount.handle,
    ...(connectedAccount.handleAliases?.split(',') || []),
  ];

  const workspaceMembersMap = workspaceMembers.reduce(
    (map, workspaceMember) => {
      map[workspaceMember.userEmail] = true;

      return map;
    },
    new Map<string, boolean>(),
  );

  const isDifferentDomain = (contact: Contact, selfDomainName: string) =>
    getDomainNameFromHandle(contact.handle) !== selfDomainName;

  return contacts.filter(
    (contact) =>
      (isDifferentDomain(contact, selfDomainName) ||
        !isWorkDomain(selfDomainName)) &&
      !workspaceMembersMap[contact.handle] &&
      !allHandles.includes(contact.handle),
  );
}
