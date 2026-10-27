import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromMcpServerEntityToFlatMcpServer = (
  args: FromEntityToFlatEntityArgs<'mcpServer'>,
): FlatMcpServer => {
  const { entity: mcpServerEntity } = args;

  const mcpServerScalarEntity = fromEntityToScalarEntity({
    metadataName: 'mcpServer',
    entity: mcpServerEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'mcpServer',
      ...args,
    });

  return {
    ...mcpServerScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
