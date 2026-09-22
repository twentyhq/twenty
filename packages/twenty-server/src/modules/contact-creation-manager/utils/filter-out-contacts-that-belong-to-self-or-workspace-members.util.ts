import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkDomain } from 'src/utils/is-work-email';

export function filterOutContactsThatBelongToSelfOrWorkspaceMembers(
  contacts: Contact[],
  connectedAccount: ConnectedAccountEntity,
  workspaceMembers: WorkspaceMemberWorkspaceEntity[],
  isInternalMessagesImportEnabled: boolean = false,
): Contact[] {
  if (!isDefined(connectedAccount.handle)) {
    throw new Error('Connected account handle is missing');
  }
  const selfDomainName = getDomainNameFromHandle(
    connectedAccount.handle,
  ).toLowerCase();

  const allHandles = [
    normalizeEmailAddress(connectedAccount.handle),
    ...(connectedAccount.handleAliases || []).map((handle) =>
      normalizeEmailAddress(handle),
    ),
  ];

  const workspaceMembersMap = workspaceMembers.reduce(
    (map, workspaceMember) => {
      // @ts-expect-error legacy noImplicitAny
      map[normalizeEmailAddress(workspaceMember.userEmail)] = true;

      return map;
    },
    new Map<string, boolean>(),
  );

  const isDifferentDomain = (contact: Contact, selfDomainName: string) =>
    getDomainNameFromHandle(contact.handle).toLowerCase() !== selfDomainName;

  return contacts.filter(
    (contact) =>
      (isDifferentDomain(contact, selfDomainName) ||
        !isWorkDomain(selfDomainName) ||
        isInternalMessagesImportEnabled) &&
      // @ts-expect-error legacy noImplicitAny
      !workspaceMembersMap[normalizeEmailAddress(contact.handle)] &&
      !allHandles.includes(normalizeEmailAddress(contact.handle)),
  );
}
