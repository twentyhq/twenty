import { getDomainNameFromHandle } from 'src/modules/messaging/utils/get-domain-name-from-handle.util';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { Contacts } from 'src/modules/connected-account/auto-companies-and-contacts-creation/types/contact.type';

export function filterOutContactsFromCompanyOrWorkspace(
  contacts: Contacts,
  selfHandle: string,
  workspaceMembers: ObjectRecord<WorkspaceMemberObjectMetadata>[],
): Contacts {
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
