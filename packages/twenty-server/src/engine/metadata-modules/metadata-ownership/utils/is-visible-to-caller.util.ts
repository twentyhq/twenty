import { type MetadataCaller } from 'src/engine/metadata-modules/metadata-ownership/types/metadata-caller.type';
import { type OwnableRootMetadataName } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-metadata-name.type';
import { type OwnableRootRow } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-row.type';
import { getOwnableRootOwnerUserWorkspaceId } from 'src/engine/metadata-modules/metadata-ownership/utils/get-ownable-root-owner-user-workspace-id.util';
import { isOwnableRootPrivate } from 'src/engine/metadata-modules/metadata-ownership/utils/is-ownable-root-private.util';
import { isOwnedByCaller } from 'src/engine/metadata-modules/metadata-ownership/utils/is-owned-by-caller.util';

export type IsVisibleToCallerArgs = {
  [P in OwnableRootMetadataName]: {
    rootMetadataName: P;
    row: OwnableRootRow<P>;
    caller: MetadataCaller;
  };
}[OwnableRootMetadataName];

export const isVisibleToCaller = ({
  rootMetadataName,
  row,
  caller,
}: IsVisibleToCallerArgs): boolean =>
  !isOwnableRootPrivate({ rootMetadataName, row }) ||
  isOwnedByCaller({
    ownerUserWorkspaceId: getOwnableRootOwnerUserWorkspaceId({
      rootMetadataName,
      row,
    }),
    caller,
  });
