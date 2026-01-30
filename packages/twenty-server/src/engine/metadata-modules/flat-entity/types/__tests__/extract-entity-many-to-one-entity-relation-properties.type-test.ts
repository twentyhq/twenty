import { type Expect, type Equal } from 'twenty-shared/testing';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';

type FieldMetadataManyToOneRelations =
  ExtractEntityManyToOneEntityRelationProperties<FieldMetadataEntity>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  // FieldMetadataEntity ManyToOne relations:
  // - object (ObjectMetadataEntity)
  // - workspace (WorkspaceEntity)
  // - application (ApplicationEntity)
  // - relationTargetFieldMetadata (FieldMetadataEntity)
  // - relationTargetObjectMetadata (ObjectMetadataEntity)
  Expect<
    Equal<
      FieldMetadataManyToOneRelations,
      | 'object'
      | 'workspace'
      | 'application'
      | 'relationTargetFieldMetadata'
      | 'relationTargetObjectMetadata'
    >
  >,
];
