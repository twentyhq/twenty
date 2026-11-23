import { MessageChannelType } from 'twenty-shared/types';

import { computeChannelAssociationSource } from 'src/modules/connected-account/utils/compute-channel-association-source.util';

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

describe('computeChannelAssociationSource', () => {
  it('returns the member behind the connected account and the channel handle', () => {
    expect(
      computeChannelAssociationSource({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        channel: { handle: 'tim@apple.dev', type: MessageChannelType.EMAIL },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'user-workspace-id',
      }),
    ).toEqual({
      accountOwnerId: 'workspace-member-id',
      handle: 'tim@apple.dev',
    });
  });

  it('returns a null owner when no member matches the connected account', () => {
    expect(
      computeChannelAssociationSource({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        channel: { handle: 'tim@apple.dev' },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'unknown-user-workspace-id',
      }),
    ).toEqual({ accountOwnerId: null, handle: 'tim@apple.dev' });
  });

  it('returns a null owner for a shared email group, whoever connected it', () => {
    expect(
      computeChannelAssociationSource({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        channel: {
          handle: 'sales@apple.dev',
          type: MessageChannelType.EMAIL_GROUP,
        },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'user-workspace-id',
      }),
    ).toEqual({ accountOwnerId: null, handle: 'sales@apple.dev' });
  });

  it('leaves both fields out while the workspace does not have them yet', () => {
    expect(
      computeChannelAssociationSource({
        accountOwnerFieldUniversalIdentifier:
          ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
        channel: { handle: 'tim@apple.dev' },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([]),
        flatWorkspaceMemberMaps,
        userWorkspaceId: 'user-workspace-id',
      }),
    ).toEqual({});
  });
});
