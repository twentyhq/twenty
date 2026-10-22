import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type CreateMcpServerInput } from 'src/engine/metadata-modules/mcp-server/dtos/create-mcp-server.input';

export const fromCreateMcpServerInputToFlatMcpServerToCreate = ({
  createMcpServerInput,
  encryptedAuthorizationHeaderValue,
  workspaceId,
  flatApplication,
}: {
  createMcpServerInput: CreateMcpServerInput;
  encryptedAuthorizationHeaderValue: EncryptedString | null;
  workspaceId: string;
  flatApplication: FlatApplication;
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
    authorizationHeaderValue: encryptedAuthorizationHeaderValue,
    isEnabled: createMcpServerInput.isEnabled ?? true,
    tools: [],
    toolsSyncedAt: null,
    toolsSyncError: null,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    universalIdentifier: id,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
