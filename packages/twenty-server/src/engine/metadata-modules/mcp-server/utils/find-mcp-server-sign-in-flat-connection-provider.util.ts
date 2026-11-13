import { isDefined } from 'twenty-shared/utils';

import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { isMcpServerSignInConnectionProvider } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-sign-in-connection-provider.util';

export const findMcpServerSignInFlatConnectionProvider = ({
  flatMcpServer,
  flatConnectionProviderMaps,
}: {
  flatMcpServer: FlatMcpServer;
  flatConnectionProviderMaps: FlatEntityMaps<FlatConnectionProvider>;
}): FlatConnectionProvider | null => {
  if (!isDefined(flatMcpServer.connectionProviderId)) {
    return null;
  }

  const flatConnectionProvider = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: flatMcpServer.connectionProviderId,
    flatEntityMaps: flatConnectionProviderMaps,
  });

  if (!isDefined(flatConnectionProvider)) {
    return null;
  }

  return isMcpServerSignInConnectionProvider({
    flatConnectionProvider,
    flatMcpServer,
  })
    ? flatConnectionProvider
    : null;
};
