import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeChannelAssociationAccountOwner } from 'src/modules/connected-account/utils/compute-channel-association-account-owner.util';

const ACCOUNT_OWNER_FIELD_UNIVERSAL_IDENTIFIER = 'account-owner-field';

const buildFlatFieldMetadataMaps = (
  universalIdentifiers: string[],
): FlatEntityMaps<FlatFieldMetadata> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      universalIdentifiers.map((universalIdentifier) => [
        universalIdentifier,
        { universalIdentifier },
      ]),
    ),
  }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const flatWorkspaceMemberMaps = {
  byId: {},
  idByUserId: {},
  idByUserWorkspaceId: { 'user-workspace-id': 'workspace-member-id' },
  userWorkspaceIdByUserId: {},
} satisfies FlatWorkspaceMemberMaps;

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
