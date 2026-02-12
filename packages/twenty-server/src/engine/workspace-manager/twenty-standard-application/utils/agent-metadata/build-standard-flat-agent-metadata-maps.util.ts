import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type CreateStandardAgentArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/agent-metadata/create-standard-agent-flat-metadata.util';
import { STANDARD_FLAT_AGENT_METADATA_BUILDERS_BY_AGENT_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/agent-metadata/create-standard-flat-agent-metadata.util';

export const buildStandardFlatAgentMetadataMaps = (
  args: Omit<CreateStandardAgentArgs, 'context'>,
): FlatEntityMaps<FlatAgent> => {
  const allAgentMetadatas: FlatAgent[] = Object.values(
    STANDARD_FLAT_AGENT_METADATA_BUILDERS_BY_AGENT_NAME,
  ).map((builder) => builder(args));

  let flatAgentMetadataMaps = createEmptyFlatEntityMaps();

  for (const agentMetadata of allAgentMetadatas) {
    flatAgentMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: agentMetadata,
      flatEntityMaps: flatAgentMetadataMaps,
    });
  }

  return flatAgentMetadataMaps;
};
