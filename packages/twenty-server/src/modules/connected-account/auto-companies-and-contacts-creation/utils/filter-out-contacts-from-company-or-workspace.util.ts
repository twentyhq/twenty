import { getDomainNameFromHandle } from 'src/modules/calendar-messaging-participant/utils/get-domain-name-from-handle.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { Contact } from 'src/modules/connected-account/auto-companies-and-contacts-creation/types/contact.type';

export function filterOutContactsFromCompanyOrWorkspace(
  contacts: Contact[],
  selfHandle: string,
  workspaceMembers: WorkspaceMemberWorkspaceEntity[],
): Contact[] {
  const selfDomainName = getDomainNameFromHandle(selfHandle);

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
      !workspaceMembersMap[contact.handle],
  );
}
