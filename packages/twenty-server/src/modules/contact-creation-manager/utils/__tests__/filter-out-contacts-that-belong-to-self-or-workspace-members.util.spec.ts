import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { filterOutContactsThatBelongToSelfOrWorkspaceMembers } from 'src/modules/contact-creation-manager/utils/filter-out-contacts-that-belong-to-self-or-workspace-members.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const account = (
  handle: string,
  handleAliases: string[] = [],
): ConnectedAccountEntity =>
  ({ handle, handleAliases }) as ConnectedAccountEntity;

const contact = (handle: string): Contact => ({ handle, displayName: handle });

describe('filterOutContactsThatBelongToSelfOrWorkspaceMembers', () => {
  it('drops same-domain contacts by default for work domains', () => {
    const contacts = [contact('alice@acme.com'), contact('bob@other.com')];
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      contacts,
      account('me@acme.com'),
      [],
    );

    expect(result).toEqual([contact('bob@other.com')]);
  });

  it('keeps same-domain contacts when isInternalMessagesImportEnabled is true', () => {
    const contacts = [contact('alice@acme.com'), contact('bob@other.com')];
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      contacts,
      account('me@acme.com'),
      [],
      true,
    );

    expect(result).toEqual(contacts);
  });

  it('still drops workspace members and self even when flag is true', () => {
    const contacts = [
      contact('alice@acme.com'),
      contact('me@acme.com'),
      contact('member@acme.com'),
    ];
    const workspaceMembers = [
      { userEmail: 'member@acme.com' } as WorkspaceMemberWorkspaceEntity,
    ];
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      contacts,
      account('me@acme.com'),
      workspaceMembers,
      true,
    );

    expect(result).toEqual([contact('alice@acme.com')]);
  });
});
