import { getFieldUniversalIdentifier } from 'twenty-shared/application';

import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type BuildReservedSystemFlatFieldMetadatasForCustomObjectArgs = {
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'applicationUniversalIdentifier'
  >;
};

export const buildReservedSystemFlatFieldMetadatasForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
}: BuildReservedSystemFlatFieldMetadatasForCustomObjectArgs): Record<
  string,
  UniversalFlatFieldMetadata
> => {
  const now = new Date().toISOString();

  const {
    createdAt,
    createdBy,
    deletedAt,
    id,
    position,
    updatedAt,
    updatedBy,
  } = PARTIAL_SYSTEM_FLAT_FIELD_METADATAS;

  const computeFieldUniversalIdentifier = (name: string) =>
    getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      name,
    });

  return {
    id: {
      ...id,
      universalIdentifier: computeFieldUniversalIdentifier(id.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: {
      ...createdAt,
      universalIdentifier: computeFieldUniversalIdentifier(createdAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    createdBy: {
      ...createdBy,
      universalIdentifier: computeFieldUniversalIdentifier(createdBy.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    deletedAt: {
      ...deletedAt,
      universalIdentifier: computeFieldUniversalIdentifier(deletedAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    position: {
      ...position,
      universalIdentifier: computeFieldUniversalIdentifier(position.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    updatedAt: {
      ...updatedAt,
      universalIdentifier: computeFieldUniversalIdentifier(updatedAt.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
    updatedBy: {
      ...updatedBy,
      universalIdentifier: computeFieldUniversalIdentifier(updatedBy.name),
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      createdAt: now,
      updatedAt: now,
    },
  } as const satisfies Record<string, UniversalFlatFieldMetadata>;
};
