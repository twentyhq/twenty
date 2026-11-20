import { computeChannelAssociationAccountOwner } from 'src/modules/connected-account/utils/compute-channel-association-account-owner.util';

const ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER = 'account-owner-field';

const buildFlatFieldMetadataMaps = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

const flatWorkspaceMemberMaps = {
  idByUserWorkspaceId: { 'user-workspace-id': 'workspace-member-id' },
};

describe('computeChannelAssociationAccountOwner', () => {
  it('returns the member behind the connected account', () => {
    expect(
      computeChannelAssociationAccountOwner({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'user-workspace-id',
      }),
    ).toEqual({ accountOwnerId: 'workspace-member-id' });
  });

  it('returns a null owner when no member matches the connected account', () => {
    expect(
      computeChannelAssociationAccountOwner({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'unknown-user-workspace-id',
      }),
    ).toEqual({ accountOwnerId: null });
  });

  it('leaves the owner out while the workspace does not have the field yet', () => {
    expect(
      computeChannelAssociationAccountOwner({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'user-workspace-id',
      }),
    ).toEqual({});
  });
});
