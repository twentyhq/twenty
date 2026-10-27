import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';

export const fromCreateMcpServerInputToFlatMcpServerToCreate = ({
  createMcpServerInput,
  workspaceId,
  flatApplication,
  connectionProviderUniversalIdentifier,
}: {
  createMcpServerInput: Pick<
    CreateMcpServerInput,
    'id' | 'name' | 'label' | 'url' | 'connectionProviderId' | 'isActive'
  >;
  workspaceId: string;
  flatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  connectionProviderUniversalIdentifier: string | null;
}): FlatMcpServer => {
  const now = new Date().toISOString();

  const { name, label, url } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createMcpServerInput,
      ['name', 'label', 'url'],
    );

  const id = createMcpServerInput.id ?? v4();

  return {
    id,
    name,
    label,
    url,
    connectionProviderId: createMcpServerInput.connectionProviderId ?? null,
    connectionProviderUniversalIdentifier,
    isActive: createMcpServerInput.isActive ?? true,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    universalIdentifier: id,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
