import { computeRecipientsWhoLostAccess } from 'src/engine/subscriptions/metadata-event/utils/compute-recipients-who-lost-access.util';

describe('computeRecipientsWhoLostAccess', () => {
  it('returns nobody when the entity stays shared with everyone', () => {
    expect(
      computeRecipientsWhoLostAccess({
        recipientUserWorkspaceIdsBefore: undefined,
        recipientUserWorkspaceIdsAfter: undefined,
      }),
    ).toBeUndefined();
  });

  it('returns nobody when the entity becomes shared with everyone', () => {
    expect(
      computeRecipientsWhoLostAccess({
        recipientUserWorkspaceIdsBefore: ['owner'],
        recipientUserWorkspaceIdsAfter: undefined,
      }),
    ).toBeUndefined();
  });

  it('returns everyone but the new recipients when a shared entity becomes private', () => {
    expect(
      computeRecipientsWhoLostAccess({
        recipientUserWorkspaceIdsBefore: undefined,
        recipientUserWorkspaceIdsAfter: ['owner'],
      }),
    ).toEqual({ excludedUserWorkspaceIds: ['owner'] });
  });

  it('returns everyone when a shared entity becomes private without an owner', () => {
    expect(
      computeRecipientsWhoLostAccess({
        recipientUserWorkspaceIdsBefore: undefined,
        recipientUserWorkspaceIdsAfter: [],
      }),
    ).toEqual({ excludedUserWorkspaceIds: [] });
  });

  it('returns the previous recipients who are no longer recipients', () => {
    expect(
      computeRecipientsWhoLostAccess({
        recipientUserWorkspaceIdsBefore: ['previous-owner', 'kept'],
        recipientUserWorkspaceIdsAfter: ['kept', 'new-owner'],
      }),
    ).toEqual({ recipientUserWorkspaceIds: ['previous-owner'] });
  });

  it('returns nobody when every previous recipient keeps access', () => {
    expect(
      computeRecipientsWhoLostAccess({
        recipientUserWorkspaceIdsBefore: ['owner'],
        recipientUserWorkspaceIdsAfter: ['owner'],
      }),
    ).toBeUndefined();
  });
});
