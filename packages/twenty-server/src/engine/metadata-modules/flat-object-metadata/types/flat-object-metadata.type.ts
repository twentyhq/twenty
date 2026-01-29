import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';

type BaseFlatObjectMetadata = FlatEntityFrom<
  Omit<ObjectMetadataEntity, 'targetRelationFields' | 'dataSourceId'>
>;
export type FlatObjectMetadata = Omit<
  BaseFlatObjectMetadata,
  '__universal' | ExtractJsonbProperties<ObjectMetadataEntity>
> &
  BaseFlatObjectMetadata['__universal'] & {
    // TODO remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
    labelIdentifierFieldMetadataUniversalIdentifier: string | null;
    imageIdentifierFieldMetadataUniversalIdentifier: string | null;
  };
