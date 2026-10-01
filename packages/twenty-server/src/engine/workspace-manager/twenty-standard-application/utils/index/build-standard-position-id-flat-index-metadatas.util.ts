import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import {
  buildPositionIdIndexForObject,
  POSITION_ID_INDEX_FIELD_NAMES,
} from 'src/engine/metadata-modules/object-metadata/utils/build-position-id-index-for-object.util';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildStandardPositionIdFlatIndexMetadatas = ({
  now,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
  twentyStandardApplicationId,
}: Omit<
  CreateStandardIndexArgs,
  'context' | 'objectName'
>): FlatIndexMetadata[] => {
  const universalFlatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  return (Object.keys(STANDARD_OBJECTS) as AllStandardObjectName[]).flatMap(
    (objectName) => {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[objectName].universalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        return [];
      }

      const universalFlatIndexMetadata = buildPositionIdIndexForObject({
        flatObjectMetadata,
        objectFlatFieldMetadatas: universalFlatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.objectMetadataUniversalIdentifier ===
            flatObjectMetadata.universalIdentifier,
        ),
        now,
      });

      if (!isDefined(universalFlatIndexMetadata)) {
        return [];
      }

      const relatedEntityIds =
        standardObjectMetadataRelatedEntityIds[objectName];
      const fieldIdByName = relatedEntityIds.fields as Record<
        string,
        { id: string }
      >;
      const indexId = v4();

      return [
        {
          ...universalFlatIndexMetadata,
          id: indexId,
          applicationId: twentyStandardApplicationId,
          workspaceId,
          objectMetadataId: relatedEntityIds.id,
          flatIndexFieldMetadatas:
            universalFlatIndexMetadata.universalFlatIndexFieldMetadatas.map(
              ({ order }) => ({
                id: v4(),
                createdAt: now,
                updatedAt: now,
                indexMetadataId: indexId,
                fieldMetadataId:
                  fieldIdByName[POSITION_ID_INDEX_FIELD_NAMES[order]].id,
                order,
                subFieldName: null,
                workspaceId,
              }),
            ),
        },
      ];
    },
  );
};
