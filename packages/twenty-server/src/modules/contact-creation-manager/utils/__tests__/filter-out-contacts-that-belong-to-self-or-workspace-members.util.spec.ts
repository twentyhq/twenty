import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { filterOutContactsThatBelongToSelfOrWorkspaceMembers } from 'src/modules/contact-creation-manager/utils/filter-out-contacts-that-belong-to-self-or-workspace-members.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const account = (
  handle: string,
  handleAliases: string[] = [],
): ConnectedAccountEntity =>
  ({ handle, handleAliases }) as ConnectedAccountEntity;

const member = (userEmail: string): WorkspaceMemberWorkspaceEntity =>
  ({ userEmail }) as unknown as WorkspaceMemberWorkspaceEntity;

const contact = (handle: string): Contact => ({ handle, displayName: handle });

describe('filterOutContactsThatBelongToSelfOrWorkspaceMembers', () => {
  it('drops contacts sharing a company domain with the connected account', () => {
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      [contact('colleague@acme.com'), contact('lead@prospect.com')],
      account('me@acme.com'),
      [],
    );

    expect(result.map((c) => c.handle)).toEqual(['lead@prospect.com']);
  });

  it('keeps same-domain contacts when the connected account is on a consumer email provider', () => {
    // gmail.com is shared by millions of unrelated people, so domain
    // equality cannot mean "teammate".
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      [contact('friend@gmail.com')],
      account('me@gmail.com'),
      [],
    );

    expect(result).toHaveLength(1);
  });

  it('keeps same-domain contacts when the connected account is on a university domain', () => {
    // Universities host thousands of unrelated members; treat them like
    // consumer providers and let collaborators through.
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      [contact('professor@mit.edu'), contact('lab-member@mit.edu')],
      account('researcher@mit.edu'),
      [],
    );

    expect(result).toHaveLength(2);
  });

  it('drops workspace members regardless of domain', () => {
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      [
        contact('teammate@partner.com'),
        contact('outsider@partner.com'),
      ],
      account('me@acme.com'),
      [member('teammate@partner.com')],
    );

    expect(result.map((c) => c.handle)).toEqual(['outsider@partner.com']);
  });

  it('drops the connected account handle and any of its aliases', () => {
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      [
        contact('me@acme.com'),
        contact('me+work@acme.com'),
        contact('real-contact@partner.com'),
      ],
      account('me@acme.com', ['me+work@acme.com']),
      [],
    );

    expect(result.map((c) => c.handle)).toEqual(['real-contact@partner.com']);
  });

  it('matches handles case-insensitively', () => {
    const result = filterOutContactsThatBelongToSelfOrWorkspaceMembers(
      [contact('Teammate@Partner.com')],
      account('me@acme.com'),
      [member('teammate@partner.com')],
    );

    expect(result).toEqual([]);
  });
});
