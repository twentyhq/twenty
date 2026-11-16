import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { buildUniversalComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/utils/build-universal-computed-field-schema-reader.util';
import { computeComputedFieldBindings } from 'src/engine/metadata-modules/computed-field/utils/compute-computed-field-bindings.util';
import { isFieldMetadataComputation } from 'src/engine/metadata-modules/computed-field/utils/is-field-metadata-computation.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// Run before validation, which never mutates: it only checks that the stored bindings are the ones the computation reads.
// Bindings sent by a client or a manifest are replaced.
export const fillComputedFieldsBindings = <
  TField extends UniversalFlatFieldMetadata,
>({
  flatFieldMetadatas,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatFieldMetadatas: TField[];
  flatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
  flatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): TField[] => {
  if (
    !flatFieldMetadatas.some(({ computation }) =>
      isFieldMetadataComputation(computation),
    )
  ) {
    return flatFieldMetadatas;
  }

  const { schemaReader, findObject } = buildUniversalComputedFieldSchemaReader({
    flatObjectMetadataMaps,
    flatFieldMetadataMapsList: [
      {
        byUniversalIdentifier: Object.fromEntries(
          flatFieldMetadatas.map((flatFieldMetadata) => [
            flatFieldMetadata.universalIdentifier,
            flatFieldMetadata,
          ]),
        ),
      },
      flatFieldMetadataMaps,
    ],
  });

  return flatFieldMetadatas.map((flatFieldMetadata) => {
    const { computation } = flatFieldMetadata;

    if (!isFieldMetadataComputation(computation)) {
      return flatFieldMetadata;
    }

    const object = findObject(
      flatFieldMetadata.objectMetadataUniversalIdentifier,
    );
    const bindings = isDefined(object)
      ? computeComputedFieldBindings({ computation, object, schemaReader })
      : undefined;
    return {
      ...flatFieldMetadata,
      computation: {
        ...removePropertiesFromRecord(computation, ['bindings']),
        ...(isDefined(bindings) ? { bindings } : {}),
      },
    };
  });
};
