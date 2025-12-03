import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { getStandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';
import { buildStandardFlatObjectMetadatas } from './create-standard-flat-object-metadata.util';

type TwentyStandardApplicationAllFlatEntityMaps = {
  [P in keyof AllFlatEntityTypesByMetadataName as MetadataToFlatEntityMapsKey<P>]: Pick<
    FlatEntityMaps<MetadataFlatEntity<P>>,
    'byId'
  >;
};

export const buildTwentyStandardApplicationAllFlatEntityMaps = ({
  createdAt,
  workspaceId,
}: {
  createdAt: Date;
  workspaceId: string;
}): TwentyStandardApplicationAllFlatEntityMaps => {
  const standardFieldMetadataIdByObjectAndFieldName =
    getStandardFieldMetadataIdByObjectAndFieldName();
  const standardFlatObjectMetadatas = buildStandardFlatObjectMetadatas({
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  });

  // Build the byId map
  const flatObjectMetadataById: Record<string, FlatObjectMetadata> =
    Object.fromEntries(
      Object.values(standardFlatObjectMetadatas).map((metadata) => [
        metadata.id,
        metadata,
      ]),
    );

  return {
    flatAgentMaps: {
      byId: {},
    },
    flatCronTriggerMaps: {
      byId: {},
    },
    flatDatabaseEventTriggerMaps: {
      byId: {},
    },
    flatFieldMetadataMaps: {
      byId: {},
    },
    flatIndexMaps: {
      byId: {},
    },
    flatObjectMetadataMaps: {
      byId: flatObjectMetadataById,
    },
    flatRoleMaps: {
      byId: {},
    },
    flatRoleTargetMaps: {
      byId: {},
    },
    flatRouteTriggerMaps: {
      byId: {},
    },
    flatServerlessFunctionMaps: {
      byId: {},
    },
    flatViewFieldMaps: {
      byId: {},
    },
    flatViewFilterMaps: {
      byId: {},
    },
    flatViewGroupMaps: {
      byId: {},
    },
    flatViewMaps: {
      byId: {},
    },
  };
};
